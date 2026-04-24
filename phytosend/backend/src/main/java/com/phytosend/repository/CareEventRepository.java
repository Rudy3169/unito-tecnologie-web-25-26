package com.phytosend.repository;

import com.phytosend.entity.CareEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Interfaccia repository per CareEvent
 */
@Repository
public interface CareEventRepository extends JpaRepository<CareEvent, Long> {

    /**
     * Trova tutti gli eventi legati a una specifica pianta (utile per il
     * calendario)
     * 
     * @param plantId ID della pianta
     * @return Lista di eventi legati alla pianta
     */
    List<CareEvent> findByPlantId(Long plantId);
}