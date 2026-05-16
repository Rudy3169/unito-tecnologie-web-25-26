package com.phytosend.repository;

import com.phytosend.entity.BotanicalCard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Interfaccia repository per BotanicalCard
 */
public interface BotanicalCardRepository extends JpaRepository<BotanicalCard, Long> {

    /**
     * Trova tutte le schede ordinate per il catalogo completo
     * 
     * @return Lista di BotanicalCard ordinate
     */
    List<BotanicalCard> findAllByOrderByCommonNameAsc();

    /**
     * Metodo per la barra di ricerca: cerca per nome comune e ORDINA
     * 
     * @param commonName Nome comune da cercare
     * @return Lista di BotanicalCard ordinate
     */
    List<BotanicalCard> findByCommonNameContainingIgnoreCaseOrderByCommonNameAsc(String commonName);

    /**
     * Metodo per la barra di ricerca: cerca per nome scientifico e ORDINA
     * 
     * @param scientificName Nome scientifico da cercare
     * @return Lista di BotanicalCard ordinate
     */
    List<BotanicalCard> findByScientificNameContainingIgnoreCaseOrderByCommonNameAsc(String scientificName);

    /**
     * Metodo per cercare schede che INIZIANO per la query e ORDINA
     * 
     * @param prefix Prefisso da cercare
     * @return Lista di BotanicalCard ordinate
     */
    List<BotanicalCard> findByCommonNameStartingWithIgnoreCaseOrderByCommonNameAsc(String prefix);

    /**
     * Metodo per cercare il nome scientifico delle schede botaniche
     * 
     * @param scientificName Nome scientifico da cercare
     * @return BotanicalCard trovata
     */
    BotanicalCard findFirstByScientificName(String scientificName);

    /**
     * Metodo per cercare usando sia il nome comune che quello scientifico
     * 
     * @param commonName     Nome comune da cercare
     * @param scientificName Nome scientifico da cercare
     * @return BotanicalCard trovata
     */
    BotanicalCard findFirstByCommonNameAndScientificName(String commonName, String scientificName);

    /**
     * Trova tutte le schede ordinate e paginate
     * 
     * @param pageable Oggetto Pageable
     * @return Page di BotanicalCard ordinate
     */
    Page<BotanicalCard> findAllByOrderByCommonNameAsc(Pageable pageable);

    /**
     * Trova schede che iniziano per una stringa, ordinate e paginate
     * 
     * @param prefix   Prefisso da cercare
     * @param pageable Oggetto Pageable
     * @return Page di BotanicalCard ordinate
     */
    Page<BotanicalCard> findByCommonNameStartingWithIgnoreCaseOrderByCommonNameAsc(String prefix, Pageable pageable);

    /**
     * Cerca schede in base al nome comune, nome scientifico o famiglia, paginate.
     * 
     * @param query    La stringa da cercare
     * @param pageable Oggetto Pageable
     * @return Page di BotanicalCard corrispondenti
     */
    @Query("SELECT b FROM BotanicalCard b WHERE " +
           "LOWER(b.commonName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.scientificName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.family) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "ORDER BY b.commonName ASC")
    Page<BotanicalCard> searchCatalog(@Param("query") String query, Pageable pageable);

    /**
     * Metodo per verificare l'esistenza di una scheda botanica tramite il nome
     * scientifico
     * 
     * @param scientificName Nome scientifico da cercare
     * @return true se la scheda esiste, false altrimenti
     */
    boolean existsByScientificNameContainingIgnoreCase(String scientificName);

    /**
     * Metodo per verificare l'esistenza esatta
     * 
     * @param scientificName Nome scientifico da cercare
     * @return true se la scheda esiste, false altrimenti
     */
    boolean existsByScientificName(String scientificName);

    /**
     * Metodo per contare le schede inserite oggi
     * 
     * @param date Data da cercare
     * @return Numero di schede inserite oggi
     */
    long countByCreatedAt(java.time.LocalDate date);
}