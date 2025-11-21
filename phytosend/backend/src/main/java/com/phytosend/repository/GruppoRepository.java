package com.phytosend.repository;

import com.phytosend.entity.Gruppo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GruppoRepository extends JpaRepository<Gruppo, Long> {
    // Trova gruppi in una certa zona
    List<Gruppo> findByZona(String zona);
}