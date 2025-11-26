package com.phytosend.controller;

import com.phytosend.entity.Plant;
import com.phytosend.service.PlantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utenti")
@CrossOrigin(origins = "http://localhost:5173") // Permette a Vite/React di chiamare il backend
public class PlantController {
    @Autowired
    private PlantService plantService;

    // Route 1: GET tutte le piante di un utente
    @GetMapping("/{utenteId}/piante")
    public List<Plant> getPianteUtente(@PathVariable Long utenteId) {
        return plantService.findPlant(utenteId);
    }
}
