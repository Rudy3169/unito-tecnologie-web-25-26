package com.phytosend.repository;

import com.phytosend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);     // Per il login
    boolean existsByEmail(String email);            // Per evitare doppioni in registrazione
    Optional<User> findByName(String name);       // Per trovare utente per nome
    Optional<User> findBySurname(String surname); // Per trovare utente per cognome
}