package com.phytosend.service;

import com.phytosend.entity.Garden;
import com.phytosend.entity.User;
import com.phytosend.repository.GardenRepository;
import com.phytosend.repository.UserRepository; // Assumo tu abbia questo
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GardenService {

    @Autowired
    private GardenRepository gardenRepository;

    @Autowired
    private UserRepository userRepository;

    // --- TROVA IL GIARDINO DI UN UTENTE ---
    public Garden getGardenByUserId(@NonNull Long userId) {
        List<Garden> gardens = gardenRepository.findByOwnerId(userId);

        if (gardens.isEmpty()) {
            // Opzionale: Se non esiste, potresti crearlo al volo o lanciare eccezione
            throw new RuntimeException("Nessun giardino trovato per l'utente " + userId);
        }
        // Essendo OneToOne, ci aspettiamo un solo giardino, prendiamo il primo
        return gardens.get(0);
    }

    // --- CREA UN GIARDINO (Se non fatto in registrazione) ---
    public Garden createGarden(@NonNull Long userId, String gardenName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        // Controllo se ha già un giardino
        if (!gardenRepository.findByOwnerId(userId).isEmpty()) {
            throw new RuntimeException("L'utente ha già un giardino!");
        }

        Garden garden = new Garden();
        garden.setName(gardenName != null ? gardenName : "Il mio giardino");
        garden.setOwner(user);

        return gardenRepository.save(garden);
    }

    // --- AGGIORNA NOME GIARDINO ---
    public Garden updateGardenName(@NonNull Long gardenId, String newName) {
        Garden garden = gardenRepository.findById(gardenId)
                .orElseThrow(() -> new RuntimeException("Giardino non trovato"));

        garden.setName(newName);
        return gardenRepository.save(garden);
    }
}