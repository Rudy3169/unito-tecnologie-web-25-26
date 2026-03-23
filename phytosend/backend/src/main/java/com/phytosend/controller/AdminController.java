package com.phytosend.controller;

import com.phytosend.service.PerenualService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private PerenualService perenualService;

    /**
     * Importa una lista di piante dal database esterno (Perenual API) per popolare il database locale.
     * L'operazione viene demandata ad un thread asincrono.
     *
     * @param pages il numero di pagine da importare dall'API (default a 5)
     * @return un messaggio di avvenuta accettazione della richiesta
     */
    @PostMapping("/import-plants")
    public ResponseEntity<String> importPlants(@RequestParam(defaultValue = "5") int pages) {
        perenualService.importPlants(pages); // Importazione asincrona
        return ResponseEntity.accepted().body("Importazione avviata in background. L'operazione potrebbe richiedere del tempo.");
    }
}
