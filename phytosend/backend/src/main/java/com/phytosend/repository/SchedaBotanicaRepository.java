package com.phytosend.repository;

import com.phytosend.entity.SchedaBotanica;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SchedaBotanicaRepository extends JpaRepository<SchedaBotanica, Long> {

    // Metodo magico di Spring Data JPA: cerca nel nome comune ignorando maiuscole/minuscole
    List<SchedaBotanica> findByNomeComuneContainingIgnoreCase(String nome);

    // Opzionale: per evitare duplicati
    boolean existsByNomeScientifico(String nomeScientifico);
}