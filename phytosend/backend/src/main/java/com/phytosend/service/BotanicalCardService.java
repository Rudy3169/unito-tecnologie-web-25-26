package com.phytosend.service;

import com.phytosend.entity.BotanicalCard;
import com.phytosend.repository.BotanicalCardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BotanicalCardService {

    @Autowired
    private BotanicalCardRepository cardRepository;

    // --- RICERCA E LETTURA (Per tutti gli utenti) ---

    // Restituisce tutto il catalogo (utile per la pagina "Esplora")
    public List<BotanicalCard> findAll() {
        return cardRepository.findAll();
    }

    // Cerca una pianta specifica per ID
    public BotanicalCard findById(Long id) {
        return cardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scheda botanica non trovata con ID: " + id));
    }

    // Cerca piante per nome comune
    public List<BotanicalCard> searchByNome(String query) {
        return cardRepository.findByCommonNameContainingIgnoreCase(query);
    }

    // --- GESTIONE CATALOGO (Per Admin o logica interna) ---

    public BotanicalCard saveCard(BotanicalCard card) {
        // Controllo duplicati base
        if (card.getId() == null && cardRepository.existsByScientificName(card.getScientificName())) {
            throw new RuntimeException("Esiste già una scheda per la specie: " + card.getScientificName());
        }
        return cardRepository.save(card);
    }

    public void deleteCard(Long id) {
        cardRepository.deleteById(id);
    }
}