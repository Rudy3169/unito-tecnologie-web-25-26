package com.phytosend.controller;

import org.springframework.beans.factory.annotation.Autowired;
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

    // Repository per accedere alle schede botaniche
    @Autowired
    private BotanicalCardRepository botanicalCardRepository;

    @Autowired
    private DataSource dataSource;

    /**
     * Endpoint per ottenere le statistiche del database
     * * @return Statistiche del database
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getDatabaseStats() {
        long count = botanicalCardRepository.count();

        String jsonResponse = String.format("{\"totalPlants\": %d}", count);
        return ResponseEntity.ok(jsonResponse);
    }

    /**
     * Endpoint per sincronizzare il catalogo con data.sql
     */
    @PostMapping("/reload-catalog")
    public ResponseEntity<?> reloadCatalog() {
        try (Connection connection = dataSource.getConnection()) {
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("data.sql"));
            return ResponseEntity.ok("Sincronizzazione completata con successo!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Errore durante la sincronizzazione: " + e.getMessage());
        }
    }
}