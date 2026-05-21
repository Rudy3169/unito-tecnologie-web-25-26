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
 * Gestore per le Piante
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
        newPlant.setDeathDate(null);

        // Salviamo la pianta
        newPlant = plantRepository.save(newPlant);

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

    /**
     * Aggiunge un evento cura manualmente.
     *
     * @param plantId ID della pianta
     * @param type tipo evento
     * @param date data completamento
     * @return la pianta aggiornata
     */
    @Transactional
    public Plant addManualCareEvent(@NonNull Long plantId, String type, LocalDate date) {
        Plant plant = plantRepository.findById(plantId)
                .orElseThrow(() -> new ResourceNotFoundException("Pianta non trovata"));

        if (plant.getDeathDate() != null) {
            throw new IllegalStateException("Non puoi aggiungere eventi cura a una pianta morta.");
        }

        // Inizializza la collezione in-memory
        if (plant.getCareEvents() != null) {
            plant.getCareEvents().size();
        }

        // Crea e salva il nuovo evento completato
        CareEvent newEvent = new CareEvent();
        newEvent.setPlant(plant);
        newEvent.setType(type);
        newEvent.setCompleted(true);
        newEvent.setCompletedDate(date);
        newEvent.setProgrammedDate(date);
        careEventRepository.save(newEvent);

        // Calcola e crea il prossimo evento SOLO se l'evento è di tipo ACQUA
        CareEvent nextEvent = null;
        if ("ACQUA".equals(type)) {
            long giorniDaAggiungere = 7; // Default per ACQUA
            if (plant.getCard() != null) {
                String frequenzaStr = plant.getCard().getWaterFrequencyDays();
                if (frequenzaStr != null && frequenzaStr.matches(".*\\d+.*")) {
                    giorniDaAggiungere = Long.parseLong(frequenzaStr.replaceAll("\\D+", ""));
                }
            }

            nextEvent = new CareEvent();
            nextEvent.setPlant(plant);
            nextEvent.setType(type);
            nextEvent.setCompleted(false);
            nextEvent.setProgrammedDate(date.plusDays(giorniDaAggiungere));
            careEventRepository.save(nextEvent);
        }

        // Sincronizza la collezione in-memory così il DtoConverter restituisce i dati corretti
        if (plant.getCareEvents() != null) {
            plant.getCareEvents().removeIf(e -> type.equals(e.getType()) && !e.isCompleted());
            plant.getCareEvents().add(newEvent);
            if (nextEvent != null) {
                plant.getCareEvents().add(nextEvent);
            }
        }

        return plant;
    }

    /**
     * Completa un evento di cura e crea automaticamente il prossimo evento.
     *
     * @param eventId ID dell'evento da completare
     * @return l'evento completato
     */
    @Transactional
    public CareEvent completeCareEvent(@NonNull Long eventId) {
        CareEvent event = careEventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Evento di cura con ID " + eventId + " non trovato"));

        // Segna come completato
        event.setCompleted(true);
        event.setCompletedDate(LocalDate.now());
        careEventRepository.save(event);

        // Se la pianta è morta, non creiamo il prossimo evento
        if (event.getPlant() != null && event.getPlant().getDeathDate() != null) {
            return event;
        }

        // Crea il prossimo evento SOLO se è di tipo ACQUA
        if ("ACQUA".equals(event.getType())) {
            CareEvent nextEvent = new CareEvent();
            nextEvent.setPlant(event.getPlant());
            nextEvent.setType(event.getType());
            nextEvent.setCompleted(false);

            long giorniDaAggiungere = 7; // Default
            if (event.getPlant().getCard() != null) {
                String frequenzaStr = event.getPlant().getCard().getWaterFrequencyDays();
                if (frequenzaStr != null && frequenzaStr.matches(".*\\d+.*")) {
                    giorniDaAggiungere = Long.parseLong(frequenzaStr.replaceAll("\\D+", ""));
                }
            }

            nextEvent.setProgrammedDate(LocalDate.now().plusDays(giorniDaAggiungere));
            careEventRepository.save(nextEvent);
        }

        return event;
    }
}