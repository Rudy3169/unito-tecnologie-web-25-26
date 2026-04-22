package com.phytosend.service;

import com.phytosend.dto.perenual.PerenualListResponse;
import com.phytosend.dto.perenual.PerenualPlantDto;
import com.phytosend.entity.BotanicalCard;
import com.phytosend.repository.BotanicalCardRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import org.springframework.lang.NonNull;

@Service
@Slf4j
public class PerenualService {

    // Configurazione delegata
    private final String apiKey;
    private final BotanicalCardRepository cardRepository;
    private final RestTemplate restTemplate;

    private static final String BASE_URL = "https://perenual.com/api/species-list";

    /**
     * Costruttore configurato autonomamente da Spring per preparare il servizio
     * Perenual.
     *
     * @param apiKey         chiave API iniettata dai file properties
     * @param cardRepository repository per l'archiviazione
     * @param restTemplate   client HTTP sincrono per API esterne
     */
    @Autowired
    public PerenualService(@Value("${perenual.api.key}") String apiKey,
            BotanicalCardRepository cardRepository,
            RestTemplate restTemplate) {
        this.apiKey = Objects.requireNonNull(apiKey, "API Key must not be null");
        this.cardRepository = cardRepository;
        this.restTemplate = restTemplate;
    }

    /**
     * Task schedulato che parte in automatico ogni notte alle 2:00.
     * Si calcola la pagina di partenza contando le piante a DB e fa un massimo di
     * 80 chiamate
     * per stare sotto il limite giornaliero di 100 richieste.
     */
    @Scheduled(cron = "0 0 19 * * ?", zone = "Europe/Rome")
    public void scheduledDailyImport() {
        log.info("Inizio importazione giornaliera automatica (Livello Pro) da Perenual...");
        long totalImported = cardRepository.count();
        int startPage = (int) (totalImported / 30) + 1;

        // LIMITIAMO A 3 PAGINE (Max 93 chiamate API in totale) per non farci bloccare!
        int endPage = startPage + 2;

        importPlants(startPage, endPage);
    }

    /**
     * Esegue l'importazione partendo da una pagina specifica fino a un limite.
     */
    @Async
    public CompletableFuture<String> importPlants(int startPage, int endPage) {
        int importedCount = 0;
        int currentPage = startPage;

        log.info("Importazione iniziata dalla pagina {} fino alla {}", startPage, endPage);

        while (currentPage <= endPage) {
            String url = BASE_URL + "?key=" + this.apiKey + "&page=" + currentPage;
            try {
                ResponseEntity<PerenualListResponse> responseEntity = restTemplate.getForEntity(url,
                        PerenualListResponse.class);
                PerenualListResponse response = responseEntity.getBody();

                // Se l'API non ha più dati, interrompiamo il ciclo
                if (response == null || response.getData() == null || response.getData().isEmpty()) {
                    log.info("Nessun altro dato trovato. Fine del database di Perenual.");
                    break;
                }

                for (PerenualPlantDto dto : response.getData()) {
                    // FILTRO BASE: salta se non ha immagine valida
                    if (dto.getDefaultImage() == null ||
                            (dto.getDefaultImage().getRegularUrl() == null
                                    && dto.getDefaultImage().getOriginalUrl() == null)) {
                        continue;
                    }

                    String rawScientificName = (dto.getScientificName() != null && !dto.getScientificName().isEmpty())
                            ? dto.getScientificName().get(0)
                            : null;
                    String scientificName = pulisciTesto(rawScientificName);

                    if (scientificName == null || scientificName.length() < 3)
                        continue;

                    // SEGNALE VIA LIBERA: Non è un duplicato! Scateniamo la seconda chiamata API!
                    if (!cardRepository.existsByScientificName(scientificName)) {

                        java.util.Map<String, Object> plantDetails = fetchPlantDetails(dto.getId());

                        if (plantDetails != null) {
                            BotanicalCard card = mapDetailToEntity(plantDetails, dto, scientificName);
                            if (card != null) {
                                cardRepository.save(card);
                                importedCount++;
                            }
                        }
                    }
                }

                if (currentPage >= response.getLastPage()) {
                    break; // Abbiamo raggiunto l'ultima pagina assoluta di Perenual
                }

                currentPage++;

                // Pausa di 2 secondi per non sovraccaricare le API di Perenual (Rate Limiting)
                Thread.sleep(2000);

            } catch (Exception e) {
                log.error("Errore durante l'importazione della pagina {}: {}", currentPage, e.getMessage());
                return CompletableFuture.completedFuture(
                        "Errore. Importate " + importedCount + " piante. Fermato a pagina " + currentPage);
            }
        }

        log.info("Importazione completata con successo: {} nuove piante aggiunte.", importedCount);
        return CompletableFuture.completedFuture(
                "Importate " + importedCount + " piante con successo. Ultima pagina letta: " + (currentPage - 1));
    }

    /**
     * Traduce il set di dati di Perenual nel formato locale.
     * Include il mapping per l'acqua, l'esposizione al sole e la classificazione
     * per immagini.
     * 
     * @param dto            il DTO proveniente dal payload della risposta
     * @param scientificName stringa estratta del nome scientifico per sicurezza
     * @return l'entità BotanicalCard mappata e pronta all'inserimento SQL
     */
    @NonNull
    private BotanicalCard mapDetailToEntity(java.util.Map<String, Object> details, PerenualPlantDto listDto,
            String scientificName) {
        BotanicalCard card = new BotanicalCard();
        card.setScientificName(scientificName);

        // Nome
        String englishName = (String) details.get("common_name");
        card.setCommonName(traduciNome(englishName));

        // 1. FAMIGLIA (Ora ce l'abbiamo!)
        String family = (String) details.get("family");
        card.setFamily(family != null && !family.isEmpty() ? pulisciTesto(family) : "Sconosciuta");

        int sconosciutiCount = 0;

        // 2. ESPOSIZIONE
        java.util.List<String> sunlightList = (java.util.List<String>) details.get("sunlight");
        String exposure = traduciEsposizione(sunlightList);
        if (exposure.contains("Sconosciut"))
            sconosciutiCount++;
        card.setExposure(exposure);

        // 3. IRRIGAZIONE E FREQUENZA
        String watering = (String) details.get("watering");
        String irrigation = traduciIrrigazione(watering);
        if (irrigation.contains("Sconosciut"))
            sconosciutiCount++;
        card.setIrrigation(irrigation);

        if ("Frequent".equalsIgnoreCase(watering)) {
            card.setWaterFrequencyDays("Ogni 2 giorni");
        } else if ("Average".equalsIgnoreCase(watering)) {
            card.setWaterFrequencyDays("Ogni 7 giorni");
        } else if ("Minimum".equalsIgnoreCase(watering)) {
            card.setWaterFrequencyDays("Ogni 14 giorni");
        } else {
            card.setWaterFrequencyDays("Sconosciuto");
            sconosciutiCount++;
        }

        // 4. TERRENO (Ora ce l'abbiamo!)
        java.util.List<String> soilList = (java.util.List<String>) details.get("soil");
        String soil = traduciTerreno(soilList);
        if (soil.contains("Sconosciuto"))
            sconosciutiCount++;
        card.setSoil(soil);

        // 5. FERTILIZZAZIONE (Rimane sconosciuta perché serve una terza API, ma va bene
        // così)
        card.setFertilization("Sconosciuto");
        sconosciutiCount++;

        // SEGNALE DI SCARTO: Ora che abbiamo il terreno, se mancano 3 campi su 5, la
        // buttiamo.
        if (sconosciutiCount >= 3) {
            return null;
        }

        // Immagini originali dal DTO della lista
        if (listDto.getDefaultImage() != null) {
            if (listDto.getDefaultImage().getRegularUrl() != null) {
                card.setUrlDefaultPhoto(listDto.getDefaultImage().getRegularUrl());
            } else {
                card.setUrlDefaultPhoto(listDto.getDefaultImage().getOriginalUrl());
            }
        }

        return card;
    }

    /* --- METODI TRADUTTORI --- */

    private String traduciIrrigazione(String eng) {
        if (eng == null)
            return "Sconosciuta";
        String lowerEng = eng.toLowerCase();
        if (lowerEng.equals("frequent"))
            return "Abbondante";
        if (lowerEng.equals("average"))
            return "Moderata";
        if (lowerEng.equals("minimum"))
            return "Scarsa";
        return "Sconosciuta";
    }

    private String traduciEsposizione(java.util.List<String> sunlight) {
        if (sunlight == null || sunlight.isEmpty())
            return "Sconosciuta";
        String joined = String.join(" ", sunlight).toLowerCase();
        if (joined.contains("full sun"))
            return "Pieno sole";
        if (joined.contains("part shade") || joined.contains("part sun"))
            return "Penombra";
        if (joined.contains("full shade") || joined.contains("shade"))
            return "Ombra";
        return "Luce diffusa"; // fallback se non capisce il termine
    }

    private String traduciNome(String englishName) {
        // Pulizia iniziale del termine inglese
        String cleanEnglishName = pulisciTesto(englishName);

        if (cleanEnglishName == null || cleanEnglishName.isEmpty() || cleanEnglishName.equalsIgnoreCase("unknown")) {
            return "Sconosciuto";
        }

        try {
            // Codifica l'URL in modo SICURO per prevenire gli errori dell'API (meglio del
            // replace)
            String encodedName = java.net.URLEncoder.encode(cleanEnglishName,
                    java.nio.charset.StandardCharsets.UTF_8.name());
            String url = "https://api.mymemory.translated.net/get?q=" + encodedName + "&langpair=en|it";

            java.util.Map response = restTemplate.getForObject(url, java.util.Map.class);

            if (response != null && response.get("responseData") != null) {
                java.util.Map responseData = (java.util.Map) response.get("responseData");
                String translated = (String) responseData.get("translatedText");

                // Puliamo anche la traduzione in uscita da eventuali sporcizie dell'API e
                // controlliamo errori
                if (translated != null && !translated.contains("MYMEMORY WARNING")) {
                    translated = pulisciTesto(translated);
                    if (translated != null && !translated.isEmpty()) {
                        return translated.substring(0, 1).toUpperCase() + translated.substring(1);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Errore di traduzione per il nome: {}", cleanEnglishName);
        }

        // Fallback: se fallisce, restituisce l'inglese ma PULITO
        return cleanEnglishName.substring(0, 1).toUpperCase() + cleanEnglishName.substring(1);
    }

    /**
     * Pulisce la stringa da tag XML/HTML, decodifica gli URL (es. %20 -> spazio)
     * e rimuove gli spazi in eccesso.
     */
    private String pulisciTesto(String input) {
        if (input == null || input.trim().isEmpty()) {
            return null;
        }
        try {
            // Decodifica eventuale URL encoding rimasto (es. %20 -> spazio)
            input = java.net.URLDecoder.decode(input, java.nio.charset.StandardCharsets.UTF_8.name());
        } catch (Exception e) {
            log.warn("Impossibile decodificare la stringa: {}", input);
        }

        // Rimuove eventuali tag XML o HTML (es. <ph x="102"/>)
        input = input.replaceAll("<[^>]*>", "");

        // Rimuove spazi doppi e fa il trim
        return input.replaceAll(" +", " ").trim();
    }

    /**
     * Esegue la SECONDA CHIAMATA all'API per scaricare i dettagli completi
     */
    private java.util.Map<String, Object> fetchPlantDetails(Long plantId) {
        String url = "https://perenual.com/api/species/details/" + plantId + "?key=" + this.apiKey;
        try {
            // Rallentiamo di 1 secondo e mezzo per non far arrabbiare il server di Perenual
            Thread.sleep(1500);
            return restTemplate.getForObject(url, java.util.Map.class);
        } catch (Exception e) {
            log.error("Impossibile recuperare i dettagli per la pianta ID {}: {}", plantId, e.getMessage());
            return null;
        }
    }

    /**
     * Traduce il terreno dall'inglese all'italiano
     */
    private String traduciTerreno(java.util.List<String> soil) {
        if (soil == null || soil.isEmpty())
            return "Sconosciuto";
        String joined = String.join(" ", soil).toLowerCase();

        if (joined.contains("sand") && joined.contains("loam"))
            return "Sabbioso e Argilloso";
        if (joined.contains("sand"))
            return "Sabbioso ben drenante";
        if (joined.contains("clay"))
            return "Argilloso e compatto";
        if (joined.contains("loam"))
            return "Terriccio universale ricco";

        return "Terriccio universale"; // Fallback ottimistico per gli altri casi
    }
}
