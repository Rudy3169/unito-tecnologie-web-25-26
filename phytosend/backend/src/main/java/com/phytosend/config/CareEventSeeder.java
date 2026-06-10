package com.phytosend.config;

import com.phytosend.entity.CareEvent;
import com.phytosend.entity.Plant;
import com.phytosend.repository.CareEventRepository;
import com.phytosend.repository.PlantRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

/**
 * Classe responsabile del popolamento iniziale del database con eventi di cura.
 */
@Component
@Order(4)
@Slf4j
public class CareEventSeeder implements CommandLineRunner {

    @Autowired
    private PlantRepository plantRepository;

    @Autowired
    private CareEventRepository careEventRepository;

    @Override
    public void run(String... args) throws Exception {
        if (careEventRepository.count() > 0) {
            log.info("Eventi di cura già presenti. Skip seeding eventi di cura.");
            return;
        }

        List<Plant> plants = plantRepository.findAll();
        if (plants.isEmpty()) {
            log.warn("Nessuna pianta trovata. Impossibile popolare gli eventi di cura.");
            return;
        }

        log.info("Popolamento storico eventi di cura per le piante...");
        Random random = new Random();

        for (Plant plant : plants) {
            if (plant.getPurchaseDate() == null) continue;

            int freq = 7; // default 7 giorni
            try {
                if (plant.getCard() != null && plant.getCard().getWaterFrequencyDays() != null) {
                    freq = Integer.parseInt(plant.getCard().getWaterFrequencyDays());
                }
            } catch (NumberFormatException e) {
                // ignoriamo se non è un numero e usiamo il default
            }

            LocalDate eventDate = plant.getPurchaseDate().plusDays(freq);
            LocalDate limitDate = plant.getDeathDate() != null ? plant.getDeathDate() : LocalDate.now();

            // Per le piante vive, fermiamo il loop di storico un ciclo prima,
            // così l'ultimo evento pendente risulta già scaduto al momento del seeding.
            // Questo simula che la pianta ha bisogno di acqua e permette al
            // CareEventScheduler di generare notifiche CARE_WATER all'avvio.
            LocalDate waterHistoryLimit = (plant.getDeathDate() == null)
                    ? limitDate.minusDays(freq / 2)
                    : limitDate;
            
            // Genera storico annaffiature
            while (eventDate.isBefore(waterHistoryLimit) || eventDate.isEqual(waterHistoryLimit)) {
                CareEvent waterEvent = new CareEvent();
                waterEvent.setPlant(plant);
                waterEvent.setType("ACQUA");
                waterEvent.setProgrammedDate(eventDate);
                waterEvent.setCompleted(true);
                // Simuliamo che venga completata lo stesso giorno o max 1 giorno di ritardo
                LocalDate generatedCompleted = eventDate.plusDays(random.nextInt(2));
                if (generatedCompleted.isAfter(LocalDate.now())) {
                    generatedCompleted = LocalDate.now();
                }
                waterEvent.setCompletedDate(generatedCompleted);
                waterEvent.setNotes("Annaffiata regolarmente");
                careEventRepository.save(waterEvent);
                
                eventDate = eventDate.plusDays(freq);
            }
            
            // Prossima annaffiatura: per le piante vive, eventDate cade qualche giorno
            // nel passato (scaduta), così il CareEventScheduler genera subito le notifiche.
            // La generiamo solo se la pianta NON è morta.
            if (plant.getDeathDate() == null) {
                CareEvent futureWater = new CareEvent();
                futureWater.setPlant(plant);
                futureWater.setType("ACQUA");
                futureWater.setProgrammedDate(eventDate);
                futureWater.setCompleted(false);
                careEventRepository.save(futureWater);
            }

            // Aggiungiamo qualche evento di CONCIME storico se la pianta è vecchia
            LocalDate dataConcime = plant.getPurchaseDate().plusDays(25);
            if (dataConcime.isBefore(limitDate) || dataConcime.isEqual(limitDate)) {
                CareEvent concime = new CareEvent();
                concime.setPlant(plant);
                concime.setType("CONCIME");
                concime.setProgrammedDate(dataConcime);
                concime.setCompleted(true);
                LocalDate concimeCompleted = dataConcime.plusDays(random.nextInt(3));
                if (concimeCompleted.isAfter(LocalDate.now())) {
                    concimeCompleted = LocalDate.now();
                }
                concime.setCompletedDate(concimeCompleted);
                concime.setNotes("Concimazione mensile effettuata");
                careEventRepository.save(concime);
            }

            // Aggiungiamo un evento di TRAVASO per le piante molto vecchie
            LocalDate dataTravaso = plant.getPurchaseDate().plusDays(100);
            if (dataTravaso.isBefore(limitDate) || dataTravaso.isEqual(limitDate)) {
                CareEvent travaso = new CareEvent();
                travaso.setPlant(plant);
                travaso.setType("TRAVASO");
                travaso.setProgrammedDate(dataTravaso);
                travaso.setCompleted(true);
                travaso.setCompletedDate(dataTravaso);
                travaso.setNotes("Cambiato vaso, ora ha più spazio");
                careEventRepository.save(travaso);
            }
        }

        log.info("Autoseed eventi di cura completato!");
    }
}
