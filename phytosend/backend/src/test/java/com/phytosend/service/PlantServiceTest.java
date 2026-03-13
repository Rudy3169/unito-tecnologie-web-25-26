package com.phytosend.service;

import com.phytosend.entity.*;
import com.phytosend.repository.CareEventRepository;
import com.phytosend.repository.PlantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
        // Setup User and Garden
        user = new User();
        user.setId(1L);
        Garden garden = new Garden();
        garden.setOwner(user);
        user.setGarden(garden);

        // Setup Botanical Card
        card = new BotanicalCard();
        card.setId(10L);
        card.setWaterFrequencyDays(7); // Water every 7 days

        // Setup Plant Stub
        plant = new Plant();
        plant.setId(100L);
        plant.setGarden(garden);
        plant.setCard(card);
    }

    @Test
    @SuppressWarnings("null")
    void addPlantToGarden_Success() {
        // Arrange
        when(plantRepository.save(any(Plant.class))).thenAnswer(invocation -> {
            Plant p = invocation.getArgument(0);
            p.setId(100L); // simulate DB generating ID
            return p;
        });
        
        // Act
        Plant createdPlant = plantService.addPlantToGarden(user, card);

        // Assert
        assertNotNull(createdPlant);
        assertEquals(100L, createdPlant.getId());
        assertEquals(user.getGarden(), createdPlant.getGarden());
        assertEquals(card, createdPlant.getCard());
        
        // Verify Repository interactions
        verify(plantRepository).save(any(Plant.class));
        
        // Verify CareEvent creation
        verify(careEventRepository).save(any(CareEvent.class));
    }

    @Test
    void findPlant_Success() {
        // Arrange
        when(plantRepository.findByOwnerId(1L)).thenReturn(Collections.singletonList(plant));

        // Act
        List<Plant> plants = plantService.findPlant(1L);

        // Assert
        assertNotNull(plants);
        assertFalse(plants.isEmpty());
        assertEquals(1, plants.size());
        assertEquals(plant, plants.get(0));
    }

    @Test
    void rimuoviPianta_Success() {
        // Act
        plantService.rimuoviPianta(100L);

        // Assert
        verify(plantRepository).deleteById(100L);
    }
}
