package com.phytosend.repository;

import com.phytosend.entity.Pianta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PiantaRepository extends JpaRepository<Pianta, Long> {
    // Metodo personalizzato per trovare le piante di un certo proprietario
    List<Pianta> findByProprietarioId(Long utenteId);
}
