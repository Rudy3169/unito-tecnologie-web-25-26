package com.phytosend.repository;

import com.phytosend.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    // Trova gruppi in una certa città
    List<Group> findByCity(String city);

    // Trova gruppi in un certo paese
    List<Group> findByCountry(String country);
}