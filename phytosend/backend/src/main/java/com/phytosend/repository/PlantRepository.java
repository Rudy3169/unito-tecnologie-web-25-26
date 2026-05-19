package com.phytosend.repository;

import com.phytosend.entity.Plant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Interfaccia Repository per le Piante
 */
@Repository
public interface PlantRepository extends JpaRepository<Plant, Long> {
    /**
     * Trova tutte le piante appartenenti a un proprietario tramite il suo giardino
     * 
     * @param ownerId ID del proprietario
     * @return Lista di piante del proprietario
     */
    List<Plant> findByGardenOwnerId(Long ownerId);
}
