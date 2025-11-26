package com.phytosend.controller;

import com.phytosend.entity.Garden;
import com.phytosend.service.GardenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gardens")
@CrossOrigin(origins = "*") // Abilita le chiamate dal Front-End React
public class GardenController {

    @Autowired
    private GardenService gardenService;

    // GET /api/gardens/user/{userId}
    // Serve per caricare la pagina del giardino dell'utente
    @GetMapping("/user/{userId}")
    public ResponseEntity<Garden> getUserGarden(@PathVariable Long userId) {
        try {
            Garden garden = gardenService.getGardenByUserId(userId);
            return ResponseEntity.ok(garden);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // POST /api/gardens/user/{userId}
    // Crea il giardino (se non è stato creato automaticamente alla registrazione)
    @PostMapping("/user/{userId}")
    public ResponseEntity<Garden> createGarden(@PathVariable Long userId, @RequestParam(defaultValue = "Il mio Giardino") String name) {
        try {
            Garden newGarden = gardenService.createGarden(userId, name);
            return ResponseEntity.ok(newGarden);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // PUT /api/gardens/{gardenId}
    // Per cambiare nome al giardino (es. "Giungle di Mario")
    @PutMapping("/{gardenId}")
    public ResponseEntity<Garden> updateGardenName(@PathVariable Long gardenId, @RequestBody String newName) {
        return ResponseEntity.ok(gardenService.updateGardenName(gardenId, newName));
    }
}