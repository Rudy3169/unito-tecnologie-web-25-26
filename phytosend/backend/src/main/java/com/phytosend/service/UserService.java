package com.phytosend.service;

import com.phytosend.entity.User;
import com.phytosend.entity.UserRole;
import com.phytosend.entity.Garden;
import com.phytosend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // --- REGISTRAZIONE ---
    public User registerUser(User newUser) {
        // Verifica se l'email esiste già
        if (userRepository.existsByEmail(newUser.getEmail())) {
            throw new RuntimeException("Un altro utente con questa email è già registrato!");
        }

        newUser.setCity(newUser.getCity());
        newUser.setPhoneNumber(newUser.getPhoneNumber());

        // Assegna ruolo di default se non presente
        if (newUser.getRole() == null) {
            newUser.setRole(UserRole.BASE);
        }

        // Salva la password in chiaro
        newUser.setPassword(newUser.getPassword());

        // Inizializza il giardino associato all'utente
         Garden garden = new Garden();
         garden.setOwner(newUser);
         newUser.setGarden(garden);

        return userRepository.save(newUser);
    }

    // --- LOGIN (Autenticazione Semplificata) ---
    public User login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Verifica password
            if (user.getPassword().equals(password)) {
                return user;
            }
        }
        throw new RuntimeException("Email o Password non valide!");
    }

    // --- LETTURA ---
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utente (" + id + ") non trovato!"));
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    // --- AGGIORNAMENTO PROFILO ---
    public User aggiornaProfilo(Long id, User updatedData) {
        User exsisting = findById(id);

        // Aggiorna solo i campi modificabili dall'utente
        exsisting.setCity(updatedData.getCity());
        exsisting.setPhoneNumber(updatedData.getPhoneNumber());

        return userRepository.save(exsisting);
    }

    // --- GESTIONE RUOLI (Upgrade/Downgrade) ---
    public User changeRole(Long id, UserRole newRole) {
        User user = findById(id);
        user.setRole(newRole);
        return userRepository.save(user);
    }

    // Metodo specifico per l'upgrade a PRO
    public User Upgrade(Long id) {
        return changeRole(id, UserRole.PRO);
    }
}