package com.phytosend.repository;

import com.phytosend.entity.BotanicalCard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BotanicalCardRepository extends JpaRepository<BotanicalCard, Long> {

    // Metodo per cercare il nome comune delle schede botaniche
    List<BotanicalCard> findByCommonNameContainingIgnoreCase(String commonName);

    // Metodo per cercare il nome scientifico delle schede botaniche
    BotanicalCard findFirstByScientificName(String scientificName);

    // Metodo per cercare il nome scientifico delle schede botaniche
    List<BotanicalCard> findByScientificNameContainingIgnoreCase(String scientificName);

    // Metodo per cercare schede botaniche il cui nome INIZIA per la query inserita
    List<BotanicalCard> findByCommonNameStartingWithIgnoreCase(String prefix);

    // Metodo per verificare l'esistenza di una scheda botanica tramite il nome
    // scientifico
    boolean existsByScientificNameContainingIgnoreCase(String scientificName);

    // Metodo per verificare l'esistenza esatta
    boolean existsByScientificName(String scientificName);
}