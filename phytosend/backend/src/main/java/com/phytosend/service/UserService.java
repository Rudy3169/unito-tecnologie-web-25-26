package com.phytosend.service;

import com.phytosend.entity.User;
import com.phytosend.entity.UserRole;
import com.phytosend.entity.Garden;
import com.phytosend.exception.ResourceNotFoundException;
import com.phytosend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Mappatura standard Spring Security per caricare il contenitore di permessi partendo dall'email.
     *
     * @param email identificativo stringa primario
     * @return UserDetails interfacciato da convertire in Token
     * @throws UsernameNotFoundException in caso di mismatch email sul db
     */
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
    
    /**
     * Ritorna l'entità proprietaria associata alla mail.
     */
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }



    /**
     * Processo core della registrazione utente.
     * Controlla duplicati per chiave email, fa il setup della cartografia e assegna un giardino vuoto iniziale.
     * Si occupa anche di triggerare la procedura di Hashing sulla password inserita in plain text.
     *
     * @param newUser scheletro dell'utente dalla form UI
     * @return profilo generato in output
     */
    @Transactional
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

    /**
     * Flusso di confronto tra le password criptate usato nell'accesso semplificato per generare responsi JWT positivi.
     *
     * @param email login email
     * @param password secret plain per confronto col digest hashato nel db
     * @return utente loggato con i permessi aggiornati
     */
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

    /**
     * Semplice lookup ad utente per ID.
     */
    public User findById(@NonNull Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utente con ID " + id + " non trovato"));
    }

    /**
     * Retrieve completo della tabella.
     */
    public List<User> findAll() {
        return userRepository.findAll();
    }

    /**
     * Retrieve della tabella in pagine.
     */
    public org.springframework.data.domain.Page<User> findAll(int page, int size) {
        return userRepository.findAll(org.springframework.data.domain.PageRequest.of(page, size));
    }

    /**
     * Funzione mirata all'editing autorizzato del solo profilo UI: sovrascrive unicamente telefono e città.
     *
     * @param id primary key utente
     * @param updatedData body precompilato nel mapping REST
     * @return status nuovo
     */
    @Transactional
    public User aggiornaProfilo(@NonNull Long id, User updatedData) {
        User exsisting = findById(id);

        // Aggiorna solo i campi modificabili dall'utente
        if (updatedData.getName() != null)
            exsisting.setName(updatedData.getName());
        if (updatedData.getSurname() != null)
            exsisting.setSurname(updatedData.getSurname());
        if (updatedData.getCity() != null)
            exsisting.setCity(updatedData.getCity());
        if (updatedData.getPhoneNumber() != null)
            exsisting.setPhoneNumber(updatedData.getPhoneNumber());
        if (updatedData.getBio() != null)
            exsisting.setBio(updatedData.getBio());
        if (updatedData.getBirthDate() != null)
            exsisting.setBirthDate(updatedData.getBirthDate());

        return userRepository.save(exsisting);
    }

    /**
     * Metodo di amministrazione per il cambio dei ruoli applicativi, ricalcola i grants su spring context.
     *
     * @param id user
     * @param newRole enumerazione ruolo di rimpiazzamento
     * @return utente in upgrade state
     */
    @Transactional
    public User changeRole(@NonNull Long id, UserRole newRole) {
        User user = findById(id);
        user.setRole(newRole);
        return userRepository.save(user);
    }

    /**
     * Abbreviazione wrapper per l'upgrade veloce d'utente al tier PRO (es. dopo acquisto abbonamento / premio interno).
     */
    @Transactional
    public User Upgrade(@NonNull Long id) {
        return changeRole(id, UserRole.PRO);
    }
}