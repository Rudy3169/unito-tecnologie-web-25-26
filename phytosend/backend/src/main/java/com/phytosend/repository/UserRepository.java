package com.phytosend.repository;

import com.phytosend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Interfaccia Repository per gli Utenti
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    /**
     * Trova un utente tramite email
     * 
     * @param email Email da cercare
     * @return Optional contenente l'utente se trovato, altrimenti Optional vuoto
     */
    Optional<User> findByEmail(String email);

    /**
     * Verifica se un utente esiste tramite email
     * 
     * @param email Email da verificare
     * @return true se l'utente esiste, false altrimenti
     */
    boolean existsByEmail(String email);

    /**
     * Trova un utente tramite nome
     * 
     * @param name Nome da cercare
     * @return Optional contenente l'utente se trovato, altrimenti Optional vuoto
     */
    Optional<User> findByName(String name);

    /**
     * Trova un utente tramite cognome
     * 
     * @param surname Cognome da cercare
     * @return Optional contenente l'utente se trovato, altrimenti Optional vuoto
     */
    Optional<User> findBySurname(String surname);
}