package com.phytosend.backend.repository;

import com.phytosend.backend.entity.Utente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UtenteRepository extends JpaRepository<Utente, Long> {
    // Metodo utile per il login
    Optional<Utente> findByEmailAndPassword(String email, String password);
}