package com.phytosend.service;

import com.phytosend.entity.Garden;
import com.phytosend.entity.User;
import com.phytosend.exception.ResourceNotFoundException;
import com.phytosend.repository.GardenRepository;
import com.phytosend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Gestore per la gestione del giardino dell'utente
 */
@Service
@Transactional(readOnly = true)
public class GardenService {

    // Repository per i giardini
    @Autowired
    private GardenRepository gardenRepository;

    // Repository per gli utenti
    @Autowired
    private UserRepository userRepository;

    /**
     * Recupera l'unico giardino associato all'ID utente fornito.
     * Dato che l'associazione tra utente e giardino è OneToOne, restituisce il
     * primo elemento o va in eccezione.
     *
     * @param userId l'ID utente di cui cercare il giardino
     * @return Garden trovato
     */
    public Garden getGardenByUserId(@NonNull Long userId) {
        List<Garden> gardens = gardenRepository.findByOwnerId(userId);

        if (gardens.isEmpty()) {
            throw new ResourceNotFoundException("Nessun giardino trovato per l'utente " + userId);
        }

        return gardens.get(0);
    }

    /**
     * Inizializza e associa un nuovo giardino allo user, verificando che non ne
     * esista già uno.
     *
     * @param userId     l'id del proprietario
     * @param gardenName un nome da assegnare o nullo per il fallback di default
     * @return il nuovo Garden salvato
     */
    @Transactional
    public Garden createGarden(@NonNull Long userId, String gardenName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato"));

        // Controllo se ha già un giardino
        if (!gardenRepository.findByOwnerId(userId).isEmpty()) {
            throw new RuntimeException("L'utente ha già un giardino!");
        }

        Garden garden = new Garden();
        garden.setName(gardenName != null ? gardenName : "Il mio giardino");
        garden.setOwner(user);

        return gardenRepository.save(garden);
    }

    /**
     * Aggiorna solamente la stringa descrittiva del nome del giardino.
     *
     * @param gardenId identificativo del giardino bersaglio
     * @param newName  il nuovo nome da applicare
     * @return l'identità del Garden col nuovo nome salvata nel repository
     */
    @Transactional
    public Garden updateGardenName(@NonNull Long gardenId, String newName) {
        Garden garden = gardenRepository.findById(gardenId)
                .orElseThrow(() -> new ResourceNotFoundException("Giardino non trovato"));

        garden.setName(newName);
        return gardenRepository.save(garden);
    }
}