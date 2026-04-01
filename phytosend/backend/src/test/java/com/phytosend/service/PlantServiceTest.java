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
        card.setWaterFrequencyDays(7);

        plant = new Plant();
        plant.setId(100L);
        plant.setGarden(garden);
        plant.setCard(card);
    }

    // ─── addPlantToGarden ──────────────────────────────────────────────────────

    /**
     * Caso felice: verifica che la pianta venga salvata con giardino e scheda
     * corretti,
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
        verify(careEventRepository).save(any(CareEvent.class));
    }

    /**
     * Verifica che la data d'acquisto venga impostata automaticamente al giorno
     * corrente.
     */
    @Test
    void addPlantToGarden_SetsPurchaseDateToToday() {
        // Arrange
        when(plantRepository.save(any(Plant.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Plant createdPlant = plantService.addPlantToGarden(user, card);

        // Assert
        assertEquals(LocalDate.now(), createdPlant.getPurchaseDate());
    }

    /**
     * Verifica che il primo CareEvent abbia tipo "ACQUA", completed=false
     * e data programmata = oggi + waterFrequencyDays della scheda botanica.
     */
    @Test
    void addPlantToGarden_CreatesWateringEventWithCorrectDateAndType() {
        // Arrange
        card.setWaterFrequencyDays(14); // ogni 14 giorni
        when(plantRepository.save(any(Plant.class))).thenAnswer(i -> i.getArgument(0));

        ArgumentCaptor<CareEvent> careEventCaptor = ArgumentCaptor.forClass(CareEvent.class);

        // Act
        plantService.addPlantToGarden(user, card);

        // Assert: catturiamo l'evento salvato e verifichiamo i campi
        verify(careEventRepository).save(careEventCaptor.capture());
        CareEvent savedEvent = careEventCaptor.getValue();

        assertEquals("ACQUA", savedEvent.getType());
        assertFalse(savedEvent.isCompleted());
        assertEquals(LocalDate.now().plusDays(14), savedEvent.getProgrammedDate());
    }

    // ─── findPlant ────────────────────────────────────────────────────────────

    /**
     * Giardino con una pianta: la lista restituita deve contenere esattamente
     * quella pianta.
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
     * Giardino vuoto: il service deve restituire una lista vuota senza eccezioni.
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
     * Giardino con più piante: verifica che vengano restituite tutte.
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
     * Caso felice: la pianta esiste → viene chiamato deleteById.
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
     * Caso di errore: la pianta non esiste → deve essere lanciata
     * ResourceNotFoundException
     * e deleteById NON deve essere chiamato.
     */
    @Test
    void rimuoviPianta_PlantNotFound_ThrowsResourceNotFoundExceptionAndSkipsDelete() {
        // Arrange
        when(plantRepository.existsById(999L)).thenReturn(false);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> plantService.rimuoviPianta(999L));
        verify(plantRepository, never()).deleteById(any());
    }}

    

    
    

    
    