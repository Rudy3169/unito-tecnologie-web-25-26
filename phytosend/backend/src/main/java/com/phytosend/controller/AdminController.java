package com.phytosend.controller;

import com.phytosend.service.PerenualService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
// @CrossOrigin rimosso: gestito globalmente in SecurityConfig
public class AdminController {

    @Autowired
    private PerenualService perenualService;

    @PostMapping("/import-plants")
    public ResponseEntity<String> importPlants(@RequestParam(defaultValue = "5") int pages) {
        String result = perenualService.importPlants(pages); // Importa 'pages' pagine, default 5 (approx 150 piante)
        return ResponseEntity.ok(result);
    }
}
