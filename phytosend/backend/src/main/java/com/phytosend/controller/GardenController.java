package com.phytosend.controller;

import com.phytosend.dto.GardenDto;
import com.phytosend.entity.Garden;
import com.phytosend.service.DtoConverter;
import com.phytosend.service.GardenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller per la gestione del giardino degli utenti
 */
@RestController
@RequestMapping("/api/gardens")
public class GardenController {

    // Servizio per la gestione del giardino
    @Autowired
    private GardenService gardenService;

    // Convertitore di DTO
    @Autowired
    private DtoConverter dtoConverter;

    /**
     * Recupera le informazioni sul giardino di proprietà di uno specifico utente
     * identificato dal suo ID.
     *
     * @param userId l'ID utente loggato o richiesto
     * @return il DTO rappresentante il giardino dell'utente
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<GardenDto> getUserGarden(@PathVariable @NonNull Long userId) {
        // Recupera il giardino dell'utente
        Garden garden = gardenService.getGardenByUserId(userId);
        // Restituisce il DTO del giardino
        return ResponseEntity.ok(dtoConverter.toGardenDto(garden));
    }

    /**
     * Inizializza un giardino nuovo, assegnandolo subito in proprietà all'utente.
     *
     * @param userId l'ID del proprietario
     * @param name   il nome descrittivo del giardino (es. "Mio Orto")
     * @return i dettagli del giardino creato in DTO
     */
    @PostMapping("/user/{userId}")
    public ResponseEntity<GardenDto> createGarden(@PathVariable @NonNull Long userId,
            @RequestParam(defaultValue = "Il mio Giardino") String name) {
        // Crea il giardino
        Garden newGarden = gardenService.createGarden(userId, name);
        // Restituisce il DTO del giardino
        return ResponseEntity.ok(dtoConverter.toGardenDto(newGarden));
    }

    /**
     * Applica una modifica al nome di visualizzazione del giardino specificato.
     *
     * @param gardenId l'ID univoco del giardino
     * @param newName  la nuova stringa per rinominarlo
     * @return DTO aggiornato post-rinomina
     */
    @PutMapping("/{gardenId}")
    public ResponseEntity<GardenDto> updateGardenName(@PathVariable @NonNull Long gardenId,
            @RequestBody String newName) {
        // Aggiorna il nome del giardino
        Garden updated = gardenService.updateGardenName(gardenId, newName);
        // Restituisce il DTO del giardino aggiornato
        return ResponseEntity.ok(dtoConverter.toGardenDto(updated));
    }
}