package com.phytosend.repository;

import com.phytosend.entity.CareEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CareEventRepository extends JpaRepository<CareEvent, Long> {
    // Trova tutti gli eventi legati a una specifica pianta (utile per il calendario)
    List<CareEvent> findByPlantId(Long plantId);
}