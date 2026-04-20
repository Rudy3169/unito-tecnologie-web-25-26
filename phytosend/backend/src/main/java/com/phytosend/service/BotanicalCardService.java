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

    /**
     * Recupera l'intero catalogo di schede botaniche dal database.
     * Utilizzato primariamente per l'esplorazione del catalogo pubblico.
     *
     * @return una lista di tutte le entità BotanicalCard
     */
    public List<BotanicalCard> findAll() {
        return cardRepository.findAllByOrderByCommonNameAsc();
    }

    /**
     * Esegue la ricerca di una scheda botanica tramite il suo identificativo
     * univoco.
     *
     * @param id l'ID primario della scheda
     * @return la scheda trovata o un'eccezione se inesistente
     */
    public BotanicalCard findById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        return cardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scheda botanica non trovata con ID: " + id));
    }

    /**
     * Cerca schede botaniche filtrando per porzioni del nome comune, ignorando le
     * maiuscole.
     *
     * @param query il termine di ricerca inserito dall'utente
     * @return la lista delle piante che soddisfano i criteri
     */
    public List<BotanicalCard> searchByNome(String query) {
        return cardRepository.findByCommonNameContainingIgnoreCaseOrderByCommonNameAsc(query);
    }

    /**
     * Salva o aggiorna una scheda botanica nel data store.
     * Inserisce la logica di controllo per prevenire l'inserimento di duplicati
     * basati sul nome scientifico.
     *
     * @param card l'oggetto BotanicalCard da salvare
     * @return la scheda persistita
     */
    @Transactional
    public BotanicalCard saveCard(BotanicalCard card) {
        // Controllo duplicati base
        if (card.getId() == null && cardRepository.existsByScientificName(card.getScientificName())) {
            throw new RuntimeException("Esiste già una scheda per la specie: " + card.getScientificName());
        }
        return cardRepository.save(card);
    }

    /**
     * Elimina definitivamente una specifica scheda botanica dal catalogo.
     *
     * @param id identificativo univoco della scheda
     */
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