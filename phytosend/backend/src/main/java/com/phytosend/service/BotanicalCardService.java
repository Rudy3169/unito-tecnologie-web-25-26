package com.phytosend.service;

import com.phytosend.entity.BotanicalCard;
import com.phytosend.exception.ResourceNotFoundException;
import com.phytosend.repository.BotanicalCardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
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
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        return cardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scheda botanica non trovata con ID: " + id));
    }

    // Cerca piante per nome comune
    public List<BotanicalCard> searchByNome(String query) {
        return cardRepository.findByCommonNameContainingIgnoreCase(query);
    }

    // --- GESTIONE CATALOGO (Per Admin o logica interna) ---

    @Transactional
    public BotanicalCard saveCard(BotanicalCard card) {
        // Controllo duplicati base
        if (card.getId() == null && cardRepository.existsByScientificName(card.getScientificName())) {
            throw new RuntimeException("Esiste già una scheda per la specie: " + card.getScientificName());
        }
        return cardRepository.save(card);
    }

    @Transactional
    public void deleteCard(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        if (!cardRepository.existsById(id)) {
            throw new ResourceNotFoundException("Scheda botanica con ID " + id + " non trovata");
        }
        cardRepository.deleteById(id);
    }
}