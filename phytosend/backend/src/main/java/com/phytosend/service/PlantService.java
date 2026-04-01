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

@Service
@Transactional(readOnly = true)
public class PlantService {

    @Autowired
    private PlantRepository plantRepository;

    @Autowired
    private CareEventRepository careEventRepository; // Per creare le notifiche

    /**
     * Inserisce fisicamente una pianta associandole la relativa scheda botanica nel giardino dell'utente.
     * Si occupa inoltre di programmare in automatico il primissimo evento di innaffiatura (CareEvent) 
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

        CareEvent firstEvent = new CareEvent();
        firstEvent.setPlant(newPlant);
        firstEvent.setType("ACQUA");
        firstEvent.setProgrammedDate(LocalDate.now().plusDays(card.getWaterFrequencyDays()));
        firstEvent.setCompleted(false);

        careEventRepository.save(firstEvent);

        return newPlant;
    }

    /**
     * Lista in sola lettura tutte le piante relative ad un utente per il popolamento UI.
     *
     * @param utenteId identificativo
     * @return lista listata da Spring Data di entità Plant
     */
    public java.util.List<Plant> findPlant(@NonNull Long utenteId) {
        return plantRepository.findByGardenOwnerId(utenteId);
    }

    /**
     * Esegue l'azione distruttiva per sganciare ed eliminare una pianta specifica dal DB.
     * Attenzione: la JPA configurerà i clear a cascata sulle careEvent collegate.
     *
     * @param plantId ID della pianta radice da distruggere
     */
    @Transactional
    public void rimuoviPianta(@NonNull Long plantId) {
        if (!plantRepository.existsById(plantId)) {
            throw new ResourceNotFoundException("Pianta con ID " + plantId + " non trovata");
        }
        plantRepository.deleteById(plantId);
    }
}