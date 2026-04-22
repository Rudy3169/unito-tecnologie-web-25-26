package com.phytosend.controller;

import com.phytosend.entity.BotanicalCard;
import com.phytosend.repository.BotanicalCardRepository;
import com.phytosend.service.BotanicalCardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogo")
public class CatalogController {

    @Autowired
    private BotanicalCardRepository botanicalCardRepository;

    @Autowired
    private BotanicalCardService botanicalCardService;

    /**
     * Metodo per cercare schede botaniche il cui nome INIZIA per la query inserita
     * 
     * @param q Query di ricerca
     * @return Lista di schede botaniche il cui nome inizia per la query inserita
     */
    @GetMapping("/ricerca")
    public ResponseEntity<List<BotanicalCard>> searchCatalog(@RequestParam(required = false) String q) {
        if (q != null && !q.trim().isEmpty()) {
            return ResponseEntity
                    .ok(botanicalCardRepository.findByCommonNameStartingWithIgnoreCaseOrderByCommonNameAsc(q));
        }
        return ResponseEntity.ok(botanicalCardRepository.findAllByOrderByCommonNameAsc());
    }

    /**
     * Recupera una singola scheda botanica completa.
     *
     * @param id ID della scheda botanica
     * @return la scheda botanica con tutte le informazioni
     */
    @GetMapping("/{id}")
    public ResponseEntity<BotanicalCard> getCard(@PathVariable Long id) {
        BotanicalCard card = botanicalCardService.findById(id);
        return ResponseEntity.ok(card);
    }
}
