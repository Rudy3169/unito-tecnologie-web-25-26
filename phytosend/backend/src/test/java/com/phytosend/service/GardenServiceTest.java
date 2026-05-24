package com.phytosend.service;

import com.phytosend.entity.Garden;
import com.phytosend.entity.User;
import com.phytosend.exception.ResourceNotFoundException;
import com.phytosend.repository.GardenRepository;
import com.phytosend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class GardenServiceTest {

    @Mock
    private GardenRepository gardenRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private GardenService gardenService;

    private User user;
    private Garden garden;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setName("Mario");

        garden = new Garden();
        garden.setId(10L);
        garden.setName("Il mio giardino");
        garden.setOwner(user);
    }

    // ─── getGardenByUserId ───────────────────────────────────────────────────

    /**
     * Verifica che il giardino venga restituito quando l'utente ne possiede uno.
     */
    @Test
    void getGardenByUserId_ExistingGarden_ReturnsGarden() {
        // Arrange
        when(gardenRepository.findByOwnerId(1L)).thenReturn(List.of(garden));

        // Act
        Garden result = gardenService.getGardenByUserId(1L);

        // Assert
        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals("Il mio giardino", result.getName());
    }

    /**
     * Verifica che venga lanciata ResourceNotFoundException se l'utente non ha un
     * giardino.
     */
    @Test
    void getGardenByUserId_NoGarden_ThrowsResourceNotFoundException() {
        // Arrange
        when(gardenRepository.findByOwnerId(99L)).thenReturn(Collections.emptyList());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> gardenService.getGardenByUserId(99L));
    }

    // ─── createGarden ────────────────────────────────────────────────────────

    /**
     * Verifica la creazione del giardino per un utente senza giardino esistente.
     */
    @Test
    void createGarden_NewGarden_CreatesSuccessfully() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(gardenRepository.findByOwnerId(1L)).thenReturn(Collections.emptyList());
        when(gardenRepository.save(any(Garden.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Garden result = gardenService.createGarden(1L, "Giardino Segreto");

        // Assert
        assertNotNull(result);
        assertEquals("Giardino Segreto", result.getName());
        assertEquals(user, result.getOwner());
        verify(gardenRepository).save(any(Garden.class));
    }

    /**
     * Verifica che il nome di default venga usato se il parametro è null.
     */
    @Test
    void createGarden_NullName_UsesDefaultName() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(gardenRepository.findByOwnerId(1L)).thenReturn(Collections.emptyList());
        when(gardenRepository.save(any(Garden.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Garden result = gardenService.createGarden(1L, null);

        // Assert
        assertEquals("Il mio giardino", result.getName());
    }

    /**
     * Verifica che venga lanciata eccezione se l'utente ha già un giardino.
     */
    @Test
    void createGarden_AlreadyHasGarden_ThrowsRuntimeException() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(gardenRepository.findByOwnerId(1L)).thenReturn(List.of(garden));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> gardenService.createGarden(1L, "Altro"));
        verify(gardenRepository, never()).save(any());
    }

    /**
     * Verifica che venga lanciata ResourceNotFoundException se l'utente non esiste.
     */
    @Test
    void createGarden_UserNotFound_ThrowsResourceNotFoundException() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> gardenService.createGarden(999L, "Nome"));
    }

    // ─── updateGardenName ────────────────────────────────────────────────────

    /**
     * Verifica che il nome del giardino venga aggiornato correttamente.
     */
    @Test
    void updateGardenName_ExistingGarden_UpdatesName() {
        // Arrange
        when(gardenRepository.findById(10L)).thenReturn(Optional.of(garden));
        when(gardenRepository.save(any(Garden.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Garden result = gardenService.updateGardenName(10L, "Giardino Rinominato");

        // Assert
        assertEquals("Giardino Rinominato", result.getName());
        verify(gardenRepository).save(garden);
    }

    /**
     * Verifica che venga lanciata ResourceNotFoundException se il giardino non
     * esiste.
     */
    @Test
    void updateGardenName_GardenNotFound_ThrowsResourceNotFoundException() {
        // Arrange
        when(gardenRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> gardenService.updateGardenName(999L, "Nuovo Nome"));
    }
}
