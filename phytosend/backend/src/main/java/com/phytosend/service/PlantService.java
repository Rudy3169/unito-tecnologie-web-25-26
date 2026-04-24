package com.phytosend.service;

import com.phytosend.entity.CareEvent;
import com.phytosend.entity.Plant;
import com.phytosend.entity.BotanicalCard;
import com.phytosend.entity.User;
import com.phytosend.exception.ResourceNotFoundException;
import com.phytosend.repository.CareEventRepository;
import com.phytosend.repository.PlantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

/**
 * Gestore per le piante
 */
@Service
@Transactional(readOnly = true)
public class PlantService {

    // Repository per le piante
    @Autowired
    private PlantRepository plantRepository;

    // Repository per gli eventi di cura
    @Autowired
    private CareEventRepository careEventRepository;

    /**
     * Aggiunge una pianta al giardino dell'utente.
     * Si occupa inoltre di programmare il primo evento di innaffiatura (CareEvent)
     * in base alla frequenza dichiarata dalla specie.
     *
     * @param user il proprietario chiamante
     * @param card la scheda botanica che detta i parametri della pianta
     * @return l'istanza della Plant persistita
     */
    @Transactional
    public Plant addPlantToGarden(User user, BotanicalCard card) {
        Plant newPlant = new Plant();
        newPlant.setGarden(user.getGarden());
        newPlant.setCard(card);
        newPlant.setPurchaseDate(LocalDate.now());

        // Salviamo la pianta
        newPlant = plantRepository.save(newPlant);

        // Creiamo il primo evento di cura
        CareEvent firstEvent = new CareEvent();
        firstEvent.setPlant(newPlant);
        firstEvent.setType("ACQUA");

        // Stringa della frequenza di annaffiatura
        String frequenzaStr = newPlant.getCard().getWaterFrequencyDays();

        // Estrai il numero. Se è "Sconosciuto", usiamo 7 giorni di default
        long giorniDaAggiungere = 7;
        if (frequenzaStr != null && frequenzaStr.matches(".*\\d+.*")) {
            giorniDaAggiungere = Long.parseLong(frequenzaStr.replaceAll("\\D+", ""));
        }

        // Calcoliamo la prossima annaffiatura partendo da OGGI
        LocalDate prossimaAnnaffiatura = LocalDate.now().plusDays(giorniDaAggiungere);

        // Imposta i valori dell'evento
        firstEvent.setCompleted(false);
        firstEvent.setProgrammedDate(prossimaAnnaffiatura);
        careEventRepository.save(firstEvent);

        // Genera anche gli eventi standard per Concime e Travaso
        CareEvent concimeEvent = new CareEvent();
        concimeEvent.setPlant(newPlant);
        concimeEvent.setType("CONCIME");
        concimeEvent.setCompleted(false);
        concimeEvent.setProgrammedDate(LocalDate.now().plusDays(30));
        careEventRepository.save(concimeEvent);

        // Creiamo l'evento di travaso
        CareEvent travasoEvent = new CareEvent();
        travasoEvent.setPlant(newPlant);
        travasoEvent.setType("TRAVASO");
        travasoEvent.setCompleted(false);
        travasoEvent.setProgrammedDate(LocalDate.now().plusDays(365));
        careEventRepository.save(travasoEvent);

        return newPlant;
    }

    /**
     * Lista in sola lettura tutte le piante relative ad un utente per il
     * popolamento UI.
     *
     * @param utenteId identificativo
     * @return lista listata da Spring Data di entità Plant
     */
    public java.util.List<Plant> findPlant(@NonNull Long utenteId) {
        return plantRepository.findByGardenOwnerId(utenteId);
    }

    /**
     * Elimina una pianta specifica dal DB.
     *
     * @param plantId ID della pianta da eliminare
     */
    @Transactional
    public void rimuoviPianta(@NonNull Long plantId) {
        if (!plantRepository.existsById(plantId)) {
            throw new ResourceNotFoundException("Pianta con ID " + plantId + " non trovata");
        }
        plantRepository.deleteById(plantId);
    }
}