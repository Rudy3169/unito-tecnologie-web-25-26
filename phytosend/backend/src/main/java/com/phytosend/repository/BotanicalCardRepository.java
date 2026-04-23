package com.phytosend.repository;

import com.phytosend.entity.BotanicalCard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BotanicalCardRepository extends JpaRepository<BotanicalCard, Long> {

    // Trova tutte le schede ordinate (per il catalogo completo)
    List<BotanicalCard> findAllByOrderByCommonNameAsc();

    // Metodo per la barra di ricerca: cerca per nome comune e ORDINA
    List<BotanicalCard> findByCommonNameContainingIgnoreCaseOrderByCommonNameAsc(String commonName);

    // Metodo per la barra di ricerca: cerca per nome scientifico e ORDINA
    List<BotanicalCard> findByScientificNameContainingIgnoreCaseOrderByCommonNameAsc(String scientificName);

    // Metodo per cercare schede che INIZIANO per la query e ORDINA
    List<BotanicalCard> findByCommonNameStartingWithIgnoreCaseOrderByCommonNameAsc(String prefix);

    // Metodo per cercare il nome scientifico delle schede botaniche
    BotanicalCard findFirstByScientificName(String scientificName);

    // Trova tutte le schede ordinate e paginate
    Page<BotanicalCard> findAllByOrderByCommonNameAsc(Pageable pageable);

    // Trova schede che iniziano per una stringa, ordinate e paginate
    Page<BotanicalCard> findByCommonNameStartingWithIgnoreCaseOrderByCommonNameAsc(String prefix, Pageable pageable);

    // Metodo per verificare l'esistenza di una scheda botanica tramite il nome
    // scientifico
    boolean existsByScientificNameContainingIgnoreCase(String scientificName);

    // Metodo per verificare l'esistenza esatta
    boolean existsByScientificName(String scientificName);

    // Metodo per contare le schede inserite oggi
    long countByCreatedAt(java.time.LocalDate date);
}