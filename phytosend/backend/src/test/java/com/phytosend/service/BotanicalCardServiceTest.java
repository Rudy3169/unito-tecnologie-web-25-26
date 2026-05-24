package com.phytosend.service;

import com.phytosend.entity.BotanicalCard;
import com.phytosend.exception.ResourceNotFoundException;
import com.phytosend.repository.BotanicalCardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class BotanicalCardServiceTest {

    @Mock
    private BotanicalCardRepository cardRepository;

    @InjectMocks
    private BotanicalCardService botanicalCardService;

    private BotanicalCard card;

    @BeforeEach
    void setUp() {
        card = new BotanicalCard();
        card.setId(1L);
        card.setCommonName("Pothos");
        card.setScientificName("Epipremnum aureum");
        card.setFamily("Araceae");
    }

    // ─── findAll ─────────────────────────────────────────────────────────────

    /**
     * Verifica che vengano restituite tutte le schede botaniche ordinate.
     */
    @Test
    void findAll_ReturnsAllCardsOrdered() {
        // Arrange
        BotanicalCard card2 = new BotanicalCard();
        card2.setId(2L);
        card2.setCommonName("Aloe");

        when(cardRepository.findAllByOrderByCommonNameAsc()).thenReturn(List.of(card2, card));

        // Act
        List<BotanicalCard> result = botanicalCardService.findAll();

        // Assert
        assertEquals(2, result.size());
        assertEquals("Aloe", result.get(0).getCommonName());
        assertEquals("Pothos", result.get(1).getCommonName());
    }

    // ─── findById ────────────────────────────────────────────────────────────

    /**
     * Verifica la ricerca per ID esistente.
     */
    @Test
    void findById_ExistingId_ReturnsCard() {
        // Arrange
        when(cardRepository.findById(1L)).thenReturn(Optional.of(card));

        // Act
        BotanicalCard result = botanicalCardService.findById(1L);

        // Assert
        assertNotNull(result);
        assertEquals("Pothos", result.getCommonName());
    }

    /**
     * Verifica che venga lanciata ResourceNotFoundException per ID non esistente.
     */
    @Test
    void findById_NonExistingId_ThrowsResourceNotFoundException() {
        // Arrange
        when(cardRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> botanicalCardService.findById(999L));
    }

    /**
     * Verifica che venga lanciata IllegalArgumentException per ID null.
     */
    @Test
    void findById_NullId_ThrowsIllegalArgumentException() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> botanicalCardService.findById(null));
    }

    // ─── searchByNome ────────────────────────────────────────────────────────

    /**
     * Verifica la ricerca per nome.
     */
    @Test
    void searchByNome_ExistingName_ReturnsMatchingCards() {
        // Arrange
        when(cardRepository.findByCommonNameContainingIgnoreCaseOrderByCommonNameAsc("Pot"))
                .thenReturn(List.of(card));

        // Act
        List<BotanicalCard> result = botanicalCardService.searchByNome("Pot");

        // Assert
        assertEquals(1, result.size());
        assertEquals("Pothos", result.get(0).getCommonName());
    }

    /**
     * Verifica che una ricerca senza risultati restituisca una lista vuota.
     */
    @Test
    void searchByNome_NoMatch_ReturnsEmptyList() {
        // Arrange
        when(cardRepository.findByCommonNameContainingIgnoreCaseOrderByCommonNameAsc("xyz"))
                .thenReturn(List.of());

        // Act
        List<BotanicalCard> result = botanicalCardService.searchByNome("xyz");

        // Assert
        assertTrue(result.isEmpty());
    }

    // ─── saveCard ────────────────────────────────────────────────────────────

    /**
     * Verifica il salvataggio di una nuova scheda botanica.
     */
    @Test
    void saveCard_NewCard_SavesSuccessfully() {
        // Arrange
        BotanicalCard newCard = new BotanicalCard();
        newCard.setScientificName("Monstera deliciosa");
        newCard.setCommonName("Monstera");

        when(cardRepository.existsByScientificName("Monstera deliciosa")).thenReturn(false);
        when(cardRepository.save(newCard)).thenReturn(newCard);

        // Act
        BotanicalCard result = botanicalCardService.saveCard(newCard);

        // Assert
        assertNotNull(result);
        assertEquals("Monstera", result.getCommonName());
        verify(cardRepository).save(newCard);
    }

    /**
     * Verifica che venga lanciata eccezione per nome scientifico duplicato.
     */
    @Test
    void saveCard_DuplicateScientificName_ThrowsRuntimeException() {
        // Arrange
        BotanicalCard newCard = new BotanicalCard();
        newCard.setScientificName("Epipremnum aureum");

        when(cardRepository.existsByScientificName("Epipremnum aureum")).thenReturn(true);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> botanicalCardService.saveCard(newCard));
        verify(cardRepository, never()).save(any());
    }

    /**
     * Verifica che l'aggiornamento di una scheda esistente (con ID già presente)
     * bypasci il check duplicati.
     */
    @Test
    void saveCard_ExistingCardUpdate_SkipsDuplicateCheck() {
        // Arrange - card ha già un ID, quindi è un update
        when(cardRepository.save(card)).thenReturn(card);

        // Act
        BotanicalCard result = botanicalCardService.saveCard(card);

        // Assert
        assertNotNull(result);
        verify(cardRepository, never()).existsByScientificName(any());
        verify(cardRepository).save(card);
    }

    // ─── deleteCard ──────────────────────────────────────────────────────────

    /**
     * Verifica l'eliminazione di una scheda esistente.
     */
    @Test
    void deleteCard_ExistingId_DeletesSuccessfully() {
        // Arrange
        when(cardRepository.existsById(1L)).thenReturn(true);

        // Act
        botanicalCardService.deleteCard(1L);

        // Assert
        verify(cardRepository).deleteById(1L);
    }

    /**
     * Verifica che venga lanciata ResourceNotFoundException per ID non trovato.
     */
    @Test
    void deleteCard_NonExistingId_ThrowsResourceNotFoundException() {
        // Arrange
        when(cardRepository.existsById(999L)).thenReturn(false);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> botanicalCardService.deleteCard(999L));
        verify(cardRepository, never()).deleteById(any());
    }

    /**
     * Verifica che venga lanciata IllegalArgumentException per ID null.
     */
    @Test
    void deleteCard_NullId_ThrowsIllegalArgumentException() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> botanicalCardService.deleteCard(null));
    }
}
