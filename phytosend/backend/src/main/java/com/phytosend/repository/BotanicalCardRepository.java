package com.phytosend.repository;

import com.phytosend.entity.BotanicalCard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BotanicalCardRepository extends JpaRepository<BotanicalCard, Long> {

    // Metodo per cercare il nome comune delle schede botaniche
    List<BotanicalCard> findByCommonNameContainingIgnoreCase(String commonName);

    // Metodo per verificare l'esistenza di una scheda botanica tramite il nome scientifico
    boolean existsByScientificNameContainingIgnoreCase(String scientificName);
}