package com.phytosend.repository;

import com.phytosend.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    // Trova gruppi in una certa citta
    List<Group> findByCityId(Long cityId);

    // Trova gruppi in un certo paese
    List<Group> findByCountryId(Long countryId);
}