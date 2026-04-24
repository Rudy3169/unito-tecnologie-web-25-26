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

/*
 * Gestore principale dell'utente e dell'autenticazione
 */
@Service
@Transactional(readOnly = true)
public class UserService implements UserDetailsService {

    // Repository per l'accesso ai dati dell'utente
    @Autowired
    private UserRepository userRepository;

    // Encoder per la gestione delle password
    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Mappatura standard Spring Security per caricare il contenitore di permessi
     * partendo dall'email.
     *
     * @param email identificativo stringa primario
     * @return UserDetails interfacciato da convertire in Token
     * @throws UsernameNotFoundException in caso di mismatch email sul db
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Trova l'utente nel database
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utente non trovato con email: " + email));

        // Crea un oggetto UserDetails con i dati dell'utente
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                new ArrayList<>());
    }

    /**
     * Ritorna l'entità proprietaria associata alla mail.
     */
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    /**
     * Processo core della registrazione utente.
     * Controlla duplicati per chiave email, fa il setup della cartografia e assegna
     * un giardino vuoto iniziale.
     * Si occupa anche di triggerare la procedura di Hashing sulla password inserita
     * in plain text.
     *
     * @param newUser scheletro dell'utente dalla form UI
     * @return profilo generato in output
     */
    @Transactional
    public @NonNull User registerUser(User newUser) {
        // Verifica se l'email esiste già
        if (userRepository.existsByEmail(newUser.getEmail())) {
            throw new RuntimeException("Un altro utente con questa email è già registrato!");
        }

        // Imposta la città e il numero di telefono
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

        // Salva l'utente
        return userRepository.save(newUser);
    }

    /**
     * Flusso di confronto tra le password criptate usato nell'accesso semplificato
     * per generare responsi JWT positivi.
     *
     * @param email    login email
     * @param password secret plain per confronto col digest hashato nel db
     * @return utente loggato con i permessi aggiornati
     */
    public User login(String email, String password) {
        // Trova l'utente nel database
        Optional<User> userOpt = userRepository.findByEmail(email);

        // Verifica se l'utente esiste
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Verifica password con l'hash
            if (passwordEncoder.matches(password, user.getPassword())) {
                return user;
            }
        }

        // Se l'utente non esiste o la password non è valida
        throw new RuntimeException("Email o Password non valide!");
    }

    /**
     * Semplice lookup ad utente per ID.
     */
    public @NonNull User findById(@NonNull Long id) {
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
     * Funzione mirata all'editing autorizzato del solo profilo UI: sovrascrive
     * unicamente telefono e città.
     *
     * @param id          primary key utente
     * @param updatedData body precompilato nel mapping REST
     * @return status nuovo
     */
    @Transactional
    public @NonNull User aggiornaProfilo(@NonNull Long id, User updatedData) {
        // Trova l'utente nel database
        User existing = findById(id);

        // Aggiorna solo i campi modificabili dall'utente
        if (updatedData.getName() != null)
            existing.setName(updatedData.getName());
        if (updatedData.getSurname() != null)
            existing.setSurname(updatedData.getSurname());
        if (updatedData.getCity() != null)
            existing.setCity(updatedData.getCity());
        if (updatedData.getPhoneNumber() != null)
            existing.setPhoneNumber(updatedData.getPhoneNumber());
        if (updatedData.getBio() != null)
            existing.setBio(updatedData.getBio());
        if (updatedData.getBirthDate() != null)
            existing.setBirthDate(updatedData.getBirthDate());

        // Salva l'utente aggiornato
        return userRepository.save(existing);
    }

    /**
     * Metodo di amministrazione per il cambio dei ruoli applicativi, ricalcola i
     * grants su spring context.
     *
     * @param id      user
     * @param newRole enumerazione ruolo di rimpiazzamento
     * @return utente in upgrade state
     */
    @Transactional
    public @NonNull User changeRole(@NonNull Long id, UserRole newRole) {
        // Trova l'utente nel database
        User user = findById(id);
        // Imposta il nuovo ruolo
        user.setRole(newRole);
        // Salva l'utente con il nuovo ruolo
        return userRepository.save(user);
    }

    /**
     * Wrapper per l'upgrade veloce d'utente al tier PRO.
     */
    @Transactional
    public @NonNull User Upgrade(@NonNull Long id) {
        // Cambia il ruolo dell'utente in PRO
        return changeRole(id, UserRole.PRO);
    }
}