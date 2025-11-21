package com.phytosend.repository;

import com.phytosend.entity.EventoCura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventoCuraRepository extends JpaRepository<EventoCura, Long> {
    // Trova tutti gli eventi legati a una specifica pianta (utile per il calendario)
    List<EventoCura> findByPiantaId(Long piantaId);
}