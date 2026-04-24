package com.phytosend.repository;

import com.phytosend.entity.Garden;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * Interfaccia repository per Garden
 */
public interface GardenRepository extends JpaRepository<Garden, Long> {
    /**
     * Trova giardini associati a un utente
     * 
     * @param userId ID dell'utente
     * @return Lista di giardini associati all'utente
     */
    List<Garden> findByOwnerId(Long userId);
}
