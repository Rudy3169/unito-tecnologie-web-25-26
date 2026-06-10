package com.phytosend.service;

import com.phytosend.entity.CareEvent;
import com.phytosend.entity.NotificationType;
import com.phytosend.entity.Plant;
import com.phytosend.entity.User;
import com.phytosend.repository.CareEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Gestore per gli Eventi di Cura
 */
@Component
public class CareEventScheduler {

    private static final Logger log = LoggerFactory.getLogger(CareEventScheduler.class);

    @Autowired
    private CareEventRepository careEventRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Esegue un controllo immediato degli eventi di cura all'avvio dell'applicazione.
     * Viene invocato dopo che tutti i CommandLineRunner (seeders) sono terminati,
     * garantendo che eventuali eventi di cura già scaduti nel database generino
     * subito le relative notifiche, senza attendere il primo ciclo del cron job.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void onApplicationReady() {
        log.info("[CareEventScheduler] Controllo iniziale eventi di cura all'avvio...");
        checkOverdueCareEvents();
    }

    /**
     * Cron job che si esegue ogni minuto.
     * Controlla tutti gli eventi di cura (tipo ACQUA) non completati
     * con data programmata <= oggi e genera una notifica CARE_WATER
     * per il proprietario della pianta.
     */
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void checkOverdueCareEvents() {
        log.info("[CareEventScheduler] Controllo eventi di cura in scadenza...");

        LocalDate today = LocalDate.now();
        List<CareEvent> overdueEvents = careEventRepository
                .findByCompletedFalseAndProgrammedDateLessThanEqual(today);

        int count = 0;
        for (CareEvent event : overdueEvents) {
            // Per ora gestiamo solo l'irrigazione
            if (!"ACQUA".equals(event.getType())) {
                continue;
            }

            Plant plant = event.getPlant();
            if (plant == null || plant.getGarden() == null || plant.getGarden().getOwner() == null) {
                continue;
            }

            // Se la pianta è morta, non inviamo notifiche di cura
            if (plant.getDeathDate() != null) {
                continue;
            }

            User owner = plant.getGarden().getOwner();
            
            // Controlla se abbiamo già inviato una notifica di sistema per questo specifico evento
            if (notificationService.existsByTypeAndSecondaryReferenceId(NotificationType.CARE_WATER, event.getId())) {
                continue;
            }

            String plantName = plant.getName() != null ? plant.getName()
                    : (plant.getCard() != null ? plant.getCard().getCommonName() : "la tua pianta");

            String message = plantName + " ha bisogno di acqua!";

            // Crea la notifica di sistema (actor = null)
            notificationService.createNotification(
                    owner,
                    null, // Nessun attore per le notifiche di sistema
                    NotificationType.CARE_WATER,
                    plant.getId(),
                    event.getId(),
                    message);
            count++;
        }

        if (count > 0) {
            log.info("[CareEventScheduler] Generate {} nuove notifiche di irrigazione.", count);
        }
    }
}
