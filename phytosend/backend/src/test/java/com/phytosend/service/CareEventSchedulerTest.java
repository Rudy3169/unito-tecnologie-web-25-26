package com.phytosend.service;

import com.phytosend.entity.*;
import com.phytosend.repository.CareEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CareEventSchedulerTest {

    @Mock
    private CareEventRepository careEventRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private CareEventScheduler careEventScheduler;

    private User owner;
    private Garden garden;
    private Plant plant;
    private BotanicalCard card;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setName("Mario");

        garden = new Garden();
        garden.setId(10L);
        garden.setOwner(owner);

        card = new BotanicalCard();
        card.setCommonName("Pothos");

        plant = new Plant();
        plant.setId(100L);
        plant.setGarden(garden);
        plant.setCard(card);
        plant.setDeathDate(null);
    }

    // ─── checkOverdueCareEvents ──────────────────────────────────────────────

    /**
     * Verifica che una notifica CARE_WATER venga generata per un evento ACQUA
     * scaduto con pianta viva.
     */
    @Test
    void checkOverdueCareEvents_OverdueWaterEvent_GeneratesNotification() {
        // Arrange
        CareEvent event = new CareEvent();
        event.setId(500L);
        event.setType("ACQUA");
        event.setCompleted(false);
        event.setProgrammedDate(LocalDate.now().minusDays(1));
        event.setPlant(plant);

        when(careEventRepository.findByCompletedFalseAndProgrammedDateLessThanEqual(LocalDate.now()))
                .thenReturn(List.of(event));

        // Act
        careEventScheduler.checkOverdueCareEvents();

        // Assert
        verify(notificationService).createNotification(
                eq(owner),
                isNull(),
                eq(NotificationType.CARE_WATER),
                eq(100L),
                eq(500L),
                contains("ha bisogno di acqua"));
    }

    /**
     * Verifica che gli eventi di tipo NON-ACQUA vengano ignorati.
     */
    @Test
    void checkOverdueCareEvents_NonWaterEvent_SkipsNotification() {
        // Arrange
        CareEvent event = new CareEvent();
        event.setId(500L);
        event.setType("CONCIME");
        event.setCompleted(false);
        event.setPlant(plant);

        when(careEventRepository.findByCompletedFalseAndProgrammedDateLessThanEqual(LocalDate.now()))
                .thenReturn(List.of(event));

        // Act
        careEventScheduler.checkOverdueCareEvents();

        // Assert
        verify(notificationService, never()).createNotification(
                any(), any(), any(), any(), any(), anyString());
    }

    /**
     * Verifica che le piante morte non generino notifiche di cura.
     */
    @Test
    void checkOverdueCareEvents_DeadPlant_SkipsNotification() {
        // Arrange
        plant.setDeathDate(LocalDate.now().minusDays(5));

        CareEvent event = new CareEvent();
        event.setId(500L);
        event.setType("ACQUA");
        event.setCompleted(false);
        event.setPlant(plant);

        when(careEventRepository.findByCompletedFalseAndProgrammedDateLessThanEqual(LocalDate.now()))
                .thenReturn(List.of(event));

        // Act
        careEventScheduler.checkOverdueCareEvents();

        // Assert
        verify(notificationService, never()).createNotification(
                any(), any(), any(), any(), any(), anyString());
    }

    /**
     * Verifica che eventi con pianta null o senza giardino vengano ignorati
     * senza errori.
     */
    @Test
    void checkOverdueCareEvents_PlantWithNullGarden_SkipsGracefully() {
        // Arrange
        Plant orphanPlant = new Plant();
        orphanPlant.setId(200L);
        orphanPlant.setGarden(null); // Nessun giardino

        CareEvent event = new CareEvent();
        event.setId(500L);
        event.setType("ACQUA");
        event.setCompleted(false);
        event.setPlant(orphanPlant);

        when(careEventRepository.findByCompletedFalseAndProgrammedDateLessThanEqual(LocalDate.now()))
                .thenReturn(List.of(event));

        // Act - non deve lanciare NullPointerException
        careEventScheduler.checkOverdueCareEvents();

        // Assert
        verify(notificationService, never()).createNotification(
                any(), any(), any(), any(), any(), anyString());
    }

    /**
     * Verifica che senza eventi scaduti non venga generata nessuna notifica.
     */
    @Test
    void checkOverdueCareEvents_NoOverdueEvents_NoNotifications() {
        // Arrange
        when(careEventRepository.findByCompletedFalseAndProgrammedDateLessThanEqual(LocalDate.now()))
                .thenReturn(List.of());

        // Act
        careEventScheduler.checkOverdueCareEvents();

        // Assert
        verify(notificationService, never()).createNotification(
                any(), any(), any(), any(), any(), anyString());
    }

    /**
     * Verifica che il nome della pianta custom venga usato nel messaggio,
     * altrimenti il nome comune della scheda botanica.
     */
    @Test
    void checkOverdueCareEvents_PlantWithCustomName_UsesCustomNameInMessage() {
        // Arrange
        plant.setName("Verdino");

        CareEvent event = new CareEvent();
        event.setId(500L);
        event.setType("ACQUA");
        event.setCompleted(false);
        event.setPlant(plant);

        when(careEventRepository.findByCompletedFalseAndProgrammedDateLessThanEqual(LocalDate.now()))
                .thenReturn(List.of(event));

        // Act
        careEventScheduler.checkOverdueCareEvents();

        // Assert
        verify(notificationService).createNotification(
                eq(owner), isNull(), eq(NotificationType.CARE_WATER),
                eq(100L), eq(500L),
                contains("Verdino"));
    }
}
