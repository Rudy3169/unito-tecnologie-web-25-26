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
        log.info("Inizio importazione giornaliera automatica da Perenual...");

        // Calcoliamo la pagina da cui ripartire.
        // Se il DB ha 300 piante, 300 / 30 = 10. Ripartiamo dalla pagina 11.
        long totalImported = cardRepository.count();
        int startPage = (int) (totalImported / 30) + 1;

        // Facciamo 80 pagine al giorno (2.400 piante) per stare sotto il limite di 100
        // chiamate
        int endPage = startPage + 80;

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
                    // Evita problemi con nomi scientifici vuoti
                    String scientificName = (dto.getScientificName() != null && !dto.getScientificName().isEmpty())
                            ? dto.getScientificName().get(0)
                            : null;

                    // Salviamo solo se non esiste già nel nostro database
                    if (scientificName != null && !cardRepository.existsByScientificName(scientificName)) {
                        BotanicalCard card = mapDtoToEntity(dto, scientificName);
                        cardRepository.save(card);
                        importedCount++;
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
    private BotanicalCard mapDtoToEntity(PerenualPlantDto dto, String scientificName) {
        BotanicalCard card = new BotanicalCard();
        card.setScientificName(scientificName);

        // 1. Traduzione del Nome Comune tramite API esterna (se manca, usa
        // "Sconosciuto")
        String englishName = dto.getCommonName();
        card.setCommonName(traduciNome(englishName));

        // 2. Famiglia: La list API di Perenual non la fornisce, quindi mettiamo
        // "Sconosciuto"
        card.setFamily("Sconosciuto");

        // 3. Esposizione: Traduzione tramite dizionario interno
        card.setExposure(traduciEsposizione(dto.getSunlight()));

        // 4. Irrigazione: Traduzione tramite dizionario interno
        String watering = dto.getWatering();
        card.setIrrigation(traduciIrrigazione(watering));

        // Mappatura logica dei giorni di annaffiatura (rimane uguale a prima)
        if ("Frequent".equalsIgnoreCase(watering)) {
            card.setWaterFrequencyDays(2);
        } else if ("Average".equalsIgnoreCase(watering)) {
            card.setWaterFrequencyDays(7);
        } else if ("Minimum".equalsIgnoreCase(watering)) {
            card.setWaterFrequencyDays(14);
        } else {
            card.setWaterFrequencyDays(7); // Default
        }

        // 5. Terriccio e Fertilizzante: Settati esplicitamente a "Sconosciuto"
        card.setFertilization("Sconosciuto");
        card.setSoil("Sconosciuto");

        // 6. Immagini
        if (dto.getDefaultImage() != null) {
            if (dto.getDefaultImage().getRegularUrl() != null) {
                card.setUrlDefaultPhoto(dto.getDefaultImage().getRegularUrl());
            } else {
                card.setUrlDefaultPhoto(dto.getDefaultImage().getOriginalUrl());
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
        if (englishName == null || englishName.trim().isEmpty())
            return "Sconosciuto";

        // Chiamata API gratuita MyMemory per tradurre dall'Inglese (en) all'Italiano
        // (it)
        try {
            String url = "https://api.mymemory.translated.net/get?q=" + englishName.replace(" ", "%20")
                    + "&langpair=en|it";
            java.util.Map response = restTemplate.getForObject(url, java.util.Map.class);

            if (response != null && response.get("responseData") != null) {
                java.util.Map responseData = (java.util.Map) response.get("responseData");
                String translated = (String) responseData.get("translatedText");

                // Evita di salvare strani messaggi di errore dell'API
                if (translated != null && !translated.contains("MYMEMORY WARNING")) {
                    // Mette la prima lettera maiuscola per eleganza
                    return translated.substring(0, 1).toUpperCase() + translated.substring(1);
                }
            }
        } catch (Exception e) {
            log.warn("Errore di traduzione per il nome: {}", englishName);
        }
        return englishName; // Fallback: se la traduzione fallisce, salva il nome in inglese
    }
}
