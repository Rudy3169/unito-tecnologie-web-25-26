package com.phytosend.service;

import com.phytosend.entity.User;
import com.phytosend.entity.UserRole;
import com.phytosend.entity.Garden;
import com.phytosend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utente non trovato con email: " + email));
        
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                new ArrayList<>() // Authorities (da implementare se necessario)
        );
    }
    
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }



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

        // Salva la password hashata
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));

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
            // Verifica password con l'hash
            if (passwordEncoder.matches(password, user.getPassword())) {
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