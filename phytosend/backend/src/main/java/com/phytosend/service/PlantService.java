package com.phytosend.service;

import com.phytosend.entity.CareEvent;
import com.phytosend.entity.Plant;
import com.phytosend.entity.BotanicalCard;
import com.phytosend.entity.User;
import com.phytosend.repository.CareEventRepository;
import com.phytosend.repository.PlantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import java.time.LocalDate;

@Service
public class PlantService {

    @Autowired
    private PlantRepository plantRepository;

    @Autowired
    private CareEventRepository careEventRepository; // Per creare le notifiche

    // Metodo per creare una nuova pianta
    public Plant addPlantToGarden(User user, BotanicalCard card) {
        Plant newPlant = new Plant();
        newPlant.setGarden(user.getGarden());
        newPlant.setCard(card);
        newPlant.setPurchaseDate(LocalDate.now());

        // Salviamo la pianta
        newPlant = plantRepository.save(newPlant);

        // Crea il primo evento di cura
        CareEvent firstEvent = new CareEvent();
        firstEvent.setPlant(newPlant);
        firstEvent.setType("ACQUA");
        // Usiamo la frequenza scritta nella scheda botanica per calcolare la data
        firstEvent.setProgrammedDate(LocalDate.now().plusDays(card.getWaterFrequencyDays()));
        firstEvent.setCompleted(false);

        careEventRepository.save(firstEvent);

        return newPlant;
    }

    // Metodo per trovare tutte le piante di un utente
    public java.util.List<Plant> findPlant(@NonNull Long utenteId) {
        return plantRepository.findByOwnerId(utenteId);
    }

    // Metodo per rimuovere una pianta
    public void rimuoviPianta(@NonNull Long plantId) {
        plantRepository.deleteById(plantId);
    }
}