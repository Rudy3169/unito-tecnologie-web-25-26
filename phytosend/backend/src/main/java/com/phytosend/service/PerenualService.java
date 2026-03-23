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
     * Costruttore configurato autonomamente da Spring per preparare il servizio Perenual.
     *
     * @param apiKey chiave API iniettata dai file properties
     * @param cardRepository repository per l'archiviazione
     * @param restTemplate client HTTP sincrono per API esterne
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
     * Lancia l'importazione automatica delle specie vegetali dall'API Perenual.
     * Esecuzione asincrona (in background) per non bloccare il chiamante a causa dei limiti di rate dell'API e del DB.
     *
     * @param maxPages il massimo numero di pagine dell'API da ispezionare
     * @return stringa asincrona riportante i conteggi dell'esito
     */
    @Async
    public CompletableFuture<String> importPlants(int maxPages) {
        int importedCount = 0;
        int currentPage = 1;

        // Loop through pages
        while (currentPage <= maxPages) {
            String url = BASE_URL + "?key=" + Objects.requireNonNull(apiKey) + "&page=" + currentPage;
            try {
                ResponseEntity<PerenualListResponse> responseEntity = restTemplate.getForEntity(url, PerenualListResponse.class);
                PerenualListResponse response = responseEntity.getBody();

                if (response == null || response.getData() == null || response.getData().isEmpty()) {
                    break; 
                }

                for (PerenualPlantDto dto : response.getData()) {
                    // Check if scientific name exists
                    String scientificName = (dto.getScientificName() != null && !dto.getScientificName().isEmpty()) 
                        ? dto.getScientificName().get(0) 
                        : null;

                    if (scientificName != null && !cardRepository.existsByScientificNameContainingIgnoreCase(scientificName)) {
                        BotanicalCard card = mapDtoToEntity(dto, Objects.requireNonNull(scientificName));
                        cardRepository.save(card);
                        importedCount++;
                    }
                }

                if (currentPage >= response.getLastPage()) {
                    break;
                }
                currentPage++;
                
                // Be polite to the API
                Thread.sleep(1000); 

            } catch (Exception e) {
                // Log and continue or break? 
                log.error("Error importing page {}: {}", currentPage, e.getMessage());
                return CompletableFuture.completedFuture("Error imported " + importedCount + " plants. Stopped at page " + currentPage + ". Error: " + e.getMessage());
            }
        }
        
        return CompletableFuture.completedFuture("Imported " + importedCount + " plants successfully from " + (currentPage - 1) + " pages.");
    }

    /**
     * Traduce il set di dati di terze parti (PerenualPlantDto) nel formato BotanicalCard standard locale.
     * Include il mapping per l'acqua, l'esposizione al sole e la classificazione per immagini.
     *
     * @param dto il DTO proveniente dal payload della risposta
     * @param scientificName stringa estratta del nome scientifico per sicurezza
     * @return l'entità BotanicalCard mappata e pronta all'inserimento SQL
     */
    @NonNull
    private BotanicalCard mapDtoToEntity(PerenualPlantDto dto, String scientificName) {
        BotanicalCard card = new BotanicalCard();
        card.setCommonName(dto.getCommonName() != null ? dto.getCommonName() : scientificName); // Fallback
        card.setScientificName(scientificName);
        
        // Family is not in default list response, usually. Leaving null or "Unknown"
        // Cycle is returned, we can put it in 'exposure' or 'other' if needed, but entity doesn't have 'cycle'.
        // We'll skip mapping family for now unless we do details fetch.

        // Default to mapped values
        card.setExposure(String.join(", ", dto.getSunlight() != null ? dto.getSunlight() : new ArrayList<>()));
        
        String watering = dto.getWatering();
        card.setIrrigation(watering);
        
        // Logical mapping for water frequency
        if ("Frequent".equalsIgnoreCase(watering)) {
            card.setWaterFrequencyDays(2);
        } else if ("Average".equalsIgnoreCase(watering)) {
            card.setWaterFrequencyDays(7);
        } else if ("Minimum".equalsIgnoreCase(watering)) {
            card.setWaterFrequencyDays(14);
        } else {
            card.setWaterFrequencyDays(7); // Default
        }

        // Image
        if (dto.getDefaultImage() != null) {
            // Prefer regular url, fallback to original
            if (dto.getDefaultImage().getRegularUrl() != null) {
                card.setUrlDefaultPhoto(dto.getDefaultImage().getRegularUrl());
            } else {
                card.setUrlDefaultPhoto(dto.getDefaultImage().getOriginalUrl());
            }
        }
        
        // Placeholder for details not in list response
        card.setFertilization("No info");
        card.setSoil("No info");
        // Family is not available in list response, so we leave it null.
        
        return card;
    }
}
