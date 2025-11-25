package com.phytosend.controller;

import com.phytosend.entity.Pianta;
import com.phytosend.service.PiantaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utenti")
@CrossOrigin(origins = "http://localhost:5173") // Permette a Vite/React di chiamare il backend
public class PiantaController {
    @Autowired
    private PiantaService piantaService;

    // Route 1: GET tutte le piante di un utente
    @GetMapping("/{utenteId}/piante")
    public List<Pianta> getPianteUtente(@PathVariable Long utenteId) {
        return piantaService.trovaPiantePerUtente(utenteId);
    }

    // Route 2: POST crea pianta per un utente
    @PostMapping("/{utenteId}/piante")
    public Pianta creaPiantaPerUtente(@PathVariable Long utenteId, @RequestBody Pianta pianta) {
        return piantaService.aggiungiPiantaPerUtente(utenteId, pianta);
    }
}
