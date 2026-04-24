package com.phytosend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.phytosend.repository.BotanicalCardRepository;

/**
 * Controller per gestire le operazioni di amministrazione
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    // Repository per accedere alle schede botaniche
    @Autowired
    private BotanicalCardRepository botanicalCardRepository;

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
}