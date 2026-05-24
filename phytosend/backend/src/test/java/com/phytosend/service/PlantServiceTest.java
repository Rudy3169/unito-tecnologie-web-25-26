package com.phytosend.service;

import com.phytosend.entity.*;
import com.phytosend.exception.ResourceNotFoundException;
import com.phytosend.repository.CareEventRepository;
import com.phytosend.repository.PlantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlantServiceTest {

    @Mock
    private PlantRepository plantRepository;

    @Mock
    private CareEventRepository careEventRepository;

    @InjectMocks
    private PlantService plantService;

    private User user;
    private BotanicalCard card;
    private Plant plant;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        Garden garden = new Garden();
        garden.setOwner(user);
        user.setGarden(garden);

        card = new BotanicalCard();
        card.setId(10L);
        card.setCommonName("Pothos");
        card.setWaterFrequencyDays("Ogni 7 giorni");

        plant = new Plant();
        plant.setId(100L);
        plant.setGarden(garden);
        plant.setCard(card);
    }

    // ─── addPlantToGarden ──────────────────────────────────────────────────────

    /**
     * Verifica che la pianta venga salvata con giardino e scheda corretti,
     * e che venga creato il CareEvent iniziale.
     */
    @Test
    @SuppressWarnings("null")
    void addPlantToGarden_Success_ReturnsSavedPlantWithCorrectRelations() {
        // Arrange
        when(plantRepository.save(any(Plant.class))).thenAnswer(invocation -> {
            Plant p = invocation.getArgument(0);
            p.setId(100L);
            return p;
        });

        // Act
        Plant createdPlant = plantService.addPlantToGarden(user, card);

        // Assert
        assertNotNull(createdPlant);
        assertEquals(100L, createdPlant.getId());
        assertEquals(user.getGarden(), createdPlant.getGarden());
        assertEquals(card, createdPlant.getCard());
        verify(plantRepository).save(any(Plant.class));
    }

    /**
     * Verifica che la data d'acquisto venga impostata automaticamente al giorno
     * corrente.
     */
    @Test
    @SuppressWarnings("null")
    void addPlantToGarden_SetsPurchaseDateToToday() {
        // Arrange
        when(plantRepository.save(any(Plant.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Plant createdPlant = plantService.addPlantToGarden(user, card);

        // Assert
        assertEquals(LocalDate.now(), createdPlant.getPurchaseDate());
    }

    /**
     * Verifica che la pianta venga salvata con deathDate a null (pianta viva).
     */
    @Test
    @SuppressWarnings("null")
    void addPlantToGarden_NewPlant_HasNullDeathDate() {
        // Arrange
        when(plantRepository.save(any(Plant.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Plant createdPlant = plantService.addPlantToGarden(user, card);

        // Assert
        assertNull(createdPlant.getDeathDate());
    }

    // ─── findPlant ────────────────────────────────────────────────────────────

    /**
     * Verifica che venga restituita la pianta corretta se il giardino contiene una
     * pianta.
     */
    @Test
    void findPlant_SinglePlant_ReturnsSingleElementList() {
        // Arrange
        when(plantRepository.findByGardenOwnerId(1L)).thenReturn(Collections.singletonList(plant));

        // Act
        List<Plant> plants = plantService.findPlant(1L);

        // Assert
        assertNotNull(plants);
        assertEquals(1, plants.size());
        assertEquals(plant, plants.get(0));
    }

    /**
     * Verifica che venga restituita una lista vuota se il giardino è vuoto.
     */
    @Test
    void findPlant_EmptyGarden_ReturnsEmptyList() {
        // Arrange
        when(plantRepository.findByGardenOwnerId(99L)).thenReturn(Collections.emptyList());

        // Act
        List<Plant> plants = plantService.findPlant(99L);

        // Assert
        assertNotNull(plants);
        assertTrue(plants.isEmpty());
    }

    /**
     * Verifica che vengano restituite tutte le piante di un giardino.
     */
    @Test
    void findPlant_MultiplePlants_ReturnsAllPlants() {
        // Arrange
        Plant plant2 = new Plant();
        plant2.setId(200L);
        plant2.setGarden(user.getGarden());

        when(plantRepository.findByGardenOwnerId(1L)).thenReturn(List.of(plant, plant2));

        // Act
        List<Plant> plants = plantService.findPlant(1L);

        // Assert
        assertEquals(2, plants.size());
        assertTrue(plants.contains(plant));
        assertTrue(plants.contains(plant2));
    }

    // ─── rimuoviPianta ────────────────────────────────────────────────────────

    /**
     * Verifica che deleteById venga chiamato se la pianta esiste.
     */
    @Test
    void rimuoviPianta_ExistingPlant_CallsDeleteById() {
        // Arrange
        when(plantRepository.existsById(100L)).thenReturn(true);

        // Act
        plantService.rimuoviPianta(100L);

        // Assert
        verify(plantRepository).deleteById(100L);
    }

    /**
     * Verifica che venga lanciata ResourceNotFoundException se la pianta non viene
     * trovata e che venga evitato il deleteById.
     */
    @Test
    void rimuoviPianta_PlantNotFound_ThrowsResourceNotFoundExceptionAndSkipsDelete() {
        // Arrange
        when(plantRepository.existsById(999L)).thenReturn(false);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> plantService.rimuoviPianta(999L));
        verify(plantRepository, never()).deleteById(org.mockito.ArgumentMatchers.anyLong());
    }

    // ─── completeCareEvent ────────────────────────────────────────────────────

    /**
     * Verifica che venga lanciata ResourceNotFoundException se l'evento non viene
     * trovato.
     */
    @Test
    @SuppressWarnings("null")
    void completeCareEvent_EventNotFound_ThrowsResourceNotFoundException() {
        // Arrange
        when(careEventRepository.findById(999L)).thenReturn(java.util.Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> plantService.completeCareEvent(999L));
        verify(careEventRepository, never()).save(any(CareEvent.class));
    }

    /**
     * Verifica che l'evento venga segnato come completato ma non venga creato il
     * successivo evento se la pianta è morta.
     */
    @Test
    @SuppressWarnings("null")
    void completeCareEvent_PlantIsDead_MarksCompletedButDoesNotCreateNextEvent() {
        // Arrange
        CareEvent event = new CareEvent();
        event.setId(500L);
        event.setType("ACQUA");
        event.setCompleted(false);

        Plant deadPlant = new Plant();
        deadPlant.setId(100L);
        deadPlant.setDeathDate(LocalDate.now().minusDays(1)); // Pianta morta ieri
        event.setPlant(deadPlant);

        when(careEventRepository.findById(500L)).thenReturn(java.util.Optional.of(event));

        // Act
        CareEvent result = plantService.completeCareEvent(500L);

        // Assert
        assertNotNull(result);
        assertTrue(result.isCompleted());
        assertEquals(LocalDate.now(), result.getCompletedDate());
        verify(careEventRepository).save(event);
        // Poiché la pianta è morta, save() viene chiamato solo una volta (per l'evento
        // completato)
        verify(careEventRepository, times(1)).save(any(CareEvent.class));
    }

    /**
     * Verifica che l'evento sia segnato come completato e venga creato il
     * successivo evento calcolando la data corretta basata sulla frequenza della
     * scheda botanica.
     */
    @Test
    @SuppressWarnings("null")
    void completeCareEvent_PlantIsAlive_MarksCompletedAndCreatesNextEvent() {
        // Arrange
        CareEvent event = new CareEvent();
        event.setId(500L);
        event.setType("ACQUA"); // Solo ACQUA crea il prossimo evento
        event.setCompleted(false);

        Plant alivePlant = new Plant();
        alivePlant.setId(100L);
        alivePlant.setDeathDate(null); // Pianta viva

        BotanicalCard aliveCard = new BotanicalCard();
        aliveCard.setWaterFrequencyDays("Ogni 10 giorni");
        alivePlant.setCard(aliveCard);

        event.setPlant(alivePlant);

        when(careEventRepository.findById(500L)).thenReturn(java.util.Optional.of(event));

        ArgumentCaptor<CareEvent> careEventCaptor = ArgumentCaptor.forClass(CareEvent.class);

        // Act
        CareEvent result = plantService.completeCareEvent(500L);

        // Assert
        assertNotNull(result);
        assertTrue(result.isCompleted());
        assertEquals(LocalDate.now(), result.getCompletedDate());

        // Verifica che siano stati salvati sia l'evento completato che il nuovo evento
        // programmato
        verify(careEventRepository, times(2)).save(careEventCaptor.capture());

        CareEvent nextEvent = careEventCaptor.getAllValues().get(1); // Il secondo è il nuovo evento creato
        assertFalse(nextEvent.isCompleted());
        assertEquals("ACQUA", nextEvent.getType());
        assertEquals(alivePlant, nextEvent.getPlant());
        assertEquals(LocalDate.now().plusDays(10), nextEvent.getProgrammedDate());
    }

    /**
     * Verifica che completeCareEvent con tipo CONCIME NON crei il prossimo evento
     * (solo ACQUA lo fa).
     */
    @Test
    @SuppressWarnings("null")
    void completeCareEvent_NonWaterType_MarksCompletedWithoutCreatingNext() {
        // Arrange
        CareEvent event = new CareEvent();
        event.setId(600L);
        event.setType("CONCIME");
        event.setCompleted(false);

        Plant alivePlant = new Plant();
        alivePlant.setId(100L);
        alivePlant.setDeathDate(null);
        alivePlant.setCard(card);
        event.setPlant(alivePlant);

        when(careEventRepository.findById(600L)).thenReturn(java.util.Optional.of(event));

        // Act
        CareEvent result = plantService.completeCareEvent(600L);

        // Assert
        assertNotNull(result);
        assertTrue(result.isCompleted());
        // Solo 1 save: l'evento completato, senza creare il prossimo
        verify(careEventRepository, times(1)).save(any(CareEvent.class));
    }

    // ─── addManualCareEvent ────────────────────────────────────────────────────

    /**
     * Verifica che un evento manuale di tipo ACQUA venga creato con completato=true
     * e che venga generato il prossimo evento programmato.
     */
    @Test
    @SuppressWarnings("null")
    void addManualCareEvent_WaterType_CreatesCompletedEventAndSchedulesNext() {
        // Arrange
        Plant alivePlant = new Plant();
        alivePlant.setId(100L);
        alivePlant.setDeathDate(null);
        alivePlant.setCard(card); // waterFrequencyDays = "Ogni 7 giorni"
        alivePlant.setCareEvents(new java.util.ArrayList<>());

        when(plantRepository.findById(100L)).thenReturn(java.util.Optional.of(alivePlant));

        ArgumentCaptor<CareEvent> captor = ArgumentCaptor.forClass(CareEvent.class);
        LocalDate today = LocalDate.now();

        // Act
        Plant result = plantService.addManualCareEvent(100L, "ACQUA", today);

        // Assert
        assertNotNull(result);
        verify(careEventRepository, times(2)).save(captor.capture());

        CareEvent completedEvent = captor.getAllValues().get(0);
        assertTrue(completedEvent.isCompleted());
        assertEquals("ACQUA", completedEvent.getType());
        assertEquals(today, completedEvent.getCompletedDate());

        CareEvent nextEvent = captor.getAllValues().get(1);
        assertFalse(nextEvent.isCompleted());
        assertEquals("ACQUA", nextEvent.getType());
        assertEquals(today.plusDays(7), nextEvent.getProgrammedDate());
    }

    /**
     * Verifica che un evento manuale di tipo CONCIME venga creato senza
     * programmare il prossimo evento.
     */
    @Test
    @SuppressWarnings("null")
    void addManualCareEvent_NonWaterType_CreatesCompletedEventOnly() {
        // Arrange
        Plant alivePlant = new Plant();
        alivePlant.setId(100L);
        alivePlant.setDeathDate(null);
        alivePlant.setCard(card);
        alivePlant.setCareEvents(new java.util.ArrayList<>());

        when(plantRepository.findById(100L)).thenReturn(java.util.Optional.of(alivePlant));
        LocalDate today = LocalDate.now();

        // Act
        Plant result = plantService.addManualCareEvent(100L, "CONCIME", today);

        // Assert
        assertNotNull(result);
        // Solo 1 save: l'evento completato, nessun prossimo evento per CONCIME
        verify(careEventRepository, times(1)).save(any(CareEvent.class));
    }

    /**
     * Verifica che venga lanciata IllegalStateException se si tenta di aggiungere
     * un evento cura a una pianta morta.
     */
    @Test
    @SuppressWarnings("null")
    void addManualCareEvent_DeadPlant_ThrowsIllegalStateException() {
        // Arrange
        Plant deadPlant = new Plant();
        deadPlant.setId(100L);
        deadPlant.setDeathDate(LocalDate.now().minusDays(1));

        when(plantRepository.findById(100L)).thenReturn(java.util.Optional.of(deadPlant));

        // Act & Assert
        assertThrows(IllegalStateException.class,
                () -> plantService.addManualCareEvent(100L, "ACQUA", LocalDate.now()));
        verify(careEventRepository, never()).save(any(CareEvent.class));
    }

    /**
     * Verifica che venga lanciata ResourceNotFoundException se la pianta non esiste.
     */
    @Test
    @SuppressWarnings("null")
    void addManualCareEvent_PlantNotFound_ThrowsResourceNotFoundException() {
        // Arrange
        when(plantRepository.findById(999L)).thenReturn(java.util.Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> plantService.addManualCareEvent(999L, "ACQUA", LocalDate.now()));
        verify(careEventRepository, never()).save(any(CareEvent.class));
    }
}
