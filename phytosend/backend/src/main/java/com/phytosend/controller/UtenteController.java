package com.phytosend.backend.controller;

import com.phytosend.backend.entity.Utente;
import com.phytosend.backend.service.UtenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utenti")
@CrossOrigin(origins = "http://localhost:5173") // Permette a Vite/React di chiamare il backend
public class UtenteController {

    @Autowired
    private UtenteService utenteService;

    // Route 1: GET tutti gli utenti
    @GetMapping
    public List<Utente> getUtenti() {
        return utenteService.trovaTutti();
    }

    // Route 2: POST crea utente
    @PostMapping
    public Utente creaUtente(@RequestBody Utente utente) {
        return utenteService.registraUtente(utente);
    }
}