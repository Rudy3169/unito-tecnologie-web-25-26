package com.phytosend.repository;

import com.phytosend.entity.CareEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Interfaccia repository per CareEvent
 */
@Repository
public interface CareEventRepository extends JpaRepository<CareEvent, Long> {

    /**
     * Trova tutti gli eventi legati a una specifica pianta (utile per il
     * calendario)
     * 
     * @param plantId ID della pianta
     * @return Lista di eventi legati alla pianta
     */
    List<CareEvent> findByPlantId(Long plantId);

    /**
     * Trova tutti gli eventi non completati con data programmata uguale o precedente
     * a quella indicata (per il cron job notturno).
     *
     * @param date la data limite (tipicamente oggi)
     * @return Lista di eventi in scadenza o scaduti
     */
    List<CareEvent> findByCompletedFalseAndProgrammedDateLessThanEqual(LocalDate date);

    /**
     * Trova l'evento pendente di una pianta per un certo tipo.
     *
     * @param plantId ID della pianta
     * @param type    tipo di evento (es. "ACQUA")
     * @return l'evento pendente, se esiste
     */
    Optional<CareEvent> findByPlantIdAndTypeAndCompletedFalse(Long plantId, String type);
}