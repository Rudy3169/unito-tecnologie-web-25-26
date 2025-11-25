package com.phytosend.repository;

import com.phytosend.entity.Utente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UtenteRepository extends JpaRepository<Utente, Long> {
    Optional<Utente> findByEmail(String email);     // Per il login
    boolean existsByEmail(String email);            // Per evitare doppioni in registrazione
    Optional<Utente> findByNome(String nome);       // Per trovare utente per nome
    Optional<Utente> findByCognome(String cognome); // Per trovare utente per cognome
}