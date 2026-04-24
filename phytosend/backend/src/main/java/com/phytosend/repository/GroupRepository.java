package com.phytosend.repository;

import com.phytosend.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Interfaccia repository per Group
 */
@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    /**
     * Trova gruppi in una certa città
     * 
     * @param city Città da cercare
     * @return Lista di gruppi nella città
     */
    List<Group> findByCity(String city);

    /**
     * Trova gruppi in un certo paese
     * 
     * @param country Paese da cercare
     * @return Lista di gruppi nel paese
     */
    List<Group> findByCountry(String country);
}