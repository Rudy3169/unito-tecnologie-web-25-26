package com.phytosend.repository;

import com.phytosend.entity.Plant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlantRepository extends JpaRepository<Plant, Long> {
    // Metodo personalizzato per trovare le piante di un certo proprietario
    List<Plant> findByOwnerId(Long ownerId);
}
