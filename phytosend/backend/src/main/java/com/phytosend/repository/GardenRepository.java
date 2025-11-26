package com.phytosend.repository;

import com.phytosend.entity.Garden;
import com.phytosend.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

public interface GardenRepository extends JpaRepository<Garden,Long> {
    // Trova giardini di un certo utente
    List<Garden> findByOwnerId(Long userId);
}
