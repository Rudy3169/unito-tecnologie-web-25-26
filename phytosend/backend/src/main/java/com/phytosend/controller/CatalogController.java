package com.phytosend.controller;

import com.phytosend.entity.BotanicalCard;
import com.phytosend.repository.BotanicalCardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogo")
public class CatalogController {

    @Autowired
    private BotanicalCardRepository botanicalCardRepository;

    /**
     * Metodo per cercare schede botaniche il cui nome INIZIA per la query inserita
     * 
     * @param q Query di ricerca
     * @return Lista di schede botaniche il cui nome inizia per la query inserita
     */
    @GetMapping("/ricerca")
    public ResponseEntity<List<BotanicalCard>> searchCatalog(@RequestParam(required = false) String q) {
        if (q != null && !q.trim().isEmpty()) {
            return ResponseEntity.ok(botanicalCardRepository.findByCommonNameStartingWithIgnoreCase(q));
        }
        return ResponseEntity.ok(botanicalCardRepository.findAll());
    }
}
