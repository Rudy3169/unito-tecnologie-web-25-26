package com.phytosend.controller;

import com.phytosend.entity.BotanicalCard;
import com.phytosend.repository.BotanicalCardRepository;
import com.phytosend.service.BotanicalCardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

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
     * e paginate
     * 
     * @param q    Query di ricerca
     * @param page Numero della pagina
     * @param size Dimensione della pagina
     * @return Lista di schede botaniche il cui nome inizia per la query inserita
     */
    @GetMapping("/ricerca")
    public ResponseEntity<Page<BotanicalCard>> searchCatalog(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {

        // Creiamo la richiesta di paginazione
        Pageable pageable = PageRequest.of(page, size);
        if (q != null && !q.trim().isEmpty()) {
            return ResponseEntity
                    .ok(botanicalCardRepository.findByCommonNameStartingWithIgnoreCaseOrderByCommonNameAsc(q,
                            pageable));
        }
        return ResponseEntity.ok(botanicalCardRepository.findAllByOrderByCommonNameAsc(pageable));
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
