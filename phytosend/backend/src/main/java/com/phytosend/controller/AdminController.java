package com.phytosend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.phytosend.repository.BotanicalCardRepository;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import javax.sql.DataSource;
import java.sql.Connection;

/**
 * Controller per gestire le operazioni di amministrazione
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private BotanicalCardRepository botanicalCardRepository;

    @Autowired
    private com.phytosend.repository.UserRepository userRepository;

    @Autowired
    private com.phytosend.repository.PostRepository postRepository;

    @Autowired
    private com.phytosend.repository.PlantRepository plantRepository;

    @Autowired
    private com.phytosend.repository.NotificationRepository notificationRepository;

    @Autowired
    private DataSource dataSource;

    /**
     * Endpoint per ottenere le statistiche del database
     * * @return Statistiche del database
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getDatabaseStats() {
        long totalPlants = botanicalCardRepository.count();
        long totalUsers = userRepository.count();
        long totalPosts = postRepository.count();
        long totalAlivePlants = plantRepository.countByDeathDateIsNull();
        long totalNotifications = notificationRepository.count();

        String jsonResponse = String.format("{\"totalPlants\": %d, \"totalUsers\": %d, \"totalPosts\": %d, \"totalAlivePlants\": %d, \"totalNotifications\": %d}", 
            totalPlants, totalUsers, totalPosts, totalAlivePlants, totalNotifications);
        return ResponseEntity.ok(jsonResponse);
    }

    /**
     * Endpoint per sincronizzare il catalogo con data.sql
     */
    @PostMapping("/reload-catalog")
    public ResponseEntity<?> reloadCatalog() {
        try (Connection connection = dataSource.getConnection()) {
            if (connection == null) {
                return ResponseEntity.status(500)
                        .body("Errore durante la sincronizzazione: Impossibile stabilire una connessione al database");
            }
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("data.sql"));
            return ResponseEntity.ok("Sincronizzazione completata con successo!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Errore durante la sincronizzazione: " + e.getMessage());
        }
    }

    /**
     * Endpoint per modificare i dati di una scheda botanica
     */
    @PutMapping("/botanical-cards/{id}")
    public ResponseEntity<?> updateBotanicalCard(@PathVariable @NonNull Long id, @RequestBody com.phytosend.dto.BotanicalCardDto cardDto) {
        return botanicalCardRepository.findById(id).map(card -> {
            if (cardDto.getCommonName() != null) card.setCommonName(cardDto.getCommonName());
            if (cardDto.getScientificName() != null) card.setScientificName(cardDto.getScientificName());
            if (cardDto.getFamily() != null) card.setFamily(cardDto.getFamily());
            if (cardDto.getExposure() != null) card.setExposure(cardDto.getExposure());
            if (cardDto.getIrrigation() != null) card.setIrrigation(cardDto.getIrrigation());
            if (cardDto.getWaterFrequencyDays() != null) card.setWaterFrequencyDays(cardDto.getWaterFrequencyDays());
            if (cardDto.getFertilization() != null) card.setFertilization(cardDto.getFertilization());
            if (cardDto.getSoil() != null) card.setSoil(cardDto.getSoil());
            if (cardDto.getUrlDefaultPhoto() != null) card.setUrlDefaultPhoto(cardDto.getUrlDefaultPhoto());
            
            botanicalCardRepository.save(java.util.Objects.requireNonNull(card));
            return ResponseEntity.ok("Scheda botanica aggiornata con successo");
        }).orElse(ResponseEntity.status(404).body("Scheda botanica non trovata"));
    }
}