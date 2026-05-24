package com.phytosend.service;

import com.phytosend.dto.*;
import com.phytosend.entity.*;
import com.phytosend.repository.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class DtoConverterTest {

    @Mock
    private PostRepository postRepository;

    @InjectMocks
    private DtoConverter dtoConverter;

    private User user;
    private BotanicalCard card;
    private Plant plant;
    private Garden garden;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setName("Mario");
        user.setSurname("Rossi");
        user.setEmail("mario@example.com");
        user.setCity("Torino");
        user.setPhoneNumber("333123");
        user.setBio("Amo le piante");
        user.setBirthDate("1990-01-01");
        user.setRole(UserRole.BASE);
        user.setProfilePhotoUrl("http://photo.jpg");

        card = new BotanicalCard();
        card.setId(10L);
        card.setCommonName("Pothos");
        card.setScientificName("Epipremnum aureum");
        card.setFamily("Araceae");
        card.setExposure("Luce indiretta");
        card.setIrrigation("Moderata");
        card.setWaterFrequencyDays("Ogni 7 giorni");
        card.setFertilization("Mensile");
        card.setSoil("Universale");
        card.setUrlDefaultPhoto("http://pothos.jpg");
        card.setCreatedAt(LocalDate.of(2025, 1, 1));

        garden = new Garden();
        garden.setId(20L);
        garden.setName("Giardino di Mario");
        garden.setOwner(user);

        plant = new Plant();
        plant.setId(100L);
        plant.setName("Verdino");
        plant.setUrlPhoto("http://verdino.jpg");
        plant.setPurchaseDate(LocalDate.of(2025, 3, 15));
        plant.setDeathDate(null);
        plant.setCard(card);
        plant.setGarden(garden);
    }

    // ─── toUserDto ───────────────────────────────────────────────────────────

    /**
     * Verifica la conversione completa User → UserDto con tutti i campi.
     */
    @Test
    void toUserDto_FullUser_MapsAllFields() {
        // Act
        UserDto dto = dtoConverter.toUserDto(user);

        // Assert
        assertNotNull(dto);
        assertEquals(1L, dto.getId());
        assertEquals("Mario", dto.getName());
        assertEquals("Rossi", dto.getSurname());
        assertEquals("mario@example.com", dto.getEmail());
        assertEquals("Torino", dto.getCity());
        assertEquals("333123", dto.getPhoneNumber());
        assertEquals("Amo le piante", dto.getBio());
        assertEquals("1990-01-01", dto.getBirthDate());
        assertEquals(UserRole.BASE, dto.getRole());
        assertEquals("http://photo.jpg", dto.getProfilePhotoUrl());
    }

    /**
     * Verifica che toUserDto con null restituisca null.
     */
    @Test
    void toUserDto_Null_ReturnsNull() {
        assertNull(dtoConverter.toUserDto(null));
    }

    // ─── toBotanicalCardDto ──────────────────────────────────────────────────

    /**
     * Verifica la conversione completa BotanicalCard → BotanicalCardDto.
     */
    @Test
    void toBotanicalCardDto_FullCard_MapsAllFields() {
        // Act
        BotanicalCardDto dto = dtoConverter.toBotanicalCardDto(card);

        // Assert
        assertNotNull(dto);
        assertEquals(10L, dto.getId());
        assertEquals("Pothos", dto.getCommonName());
        assertEquals("Epipremnum aureum", dto.getScientificName());
        assertEquals("Araceae", dto.getFamily());
        assertEquals("Luce indiretta", dto.getExposure());
        assertEquals("Moderata", dto.getIrrigation());
        assertEquals("Ogni 7 giorni", dto.getWaterFrequencyDays());
        assertEquals("Mensile", dto.getFertilization());
        assertEquals("Universale", dto.getSoil());
        assertEquals("http://pothos.jpg", dto.getUrlDefaultPhoto());
        assertEquals(LocalDate.of(2025, 1, 1), dto.getCreatedAt());
    }

    /**
     * Verifica che toBotanicalCardDto con null restituisca null.
     */
    @Test
    void toBotanicalCardDto_Null_ReturnsNull() {
        assertNull(dtoConverter.toBotanicalCardDto(null));
    }

    // ─── toCareEventDto ──────────────────────────────────────────────────────

    /**
     * Verifica la conversione CareEvent → CareEventDto.
     */
    @Test
    void toCareEventDto_FullEvent_MapsAllFields() {
        // Arrange
        CareEvent event = new CareEvent();
        event.setId(500L);
        event.setProgrammedDate(LocalDate.of(2025, 6, 1));
        event.setType("ACQUA");
        event.setCompleted(true);
        event.setCompletedDate(LocalDate.of(2025, 6, 1));
        event.setNotes("Fatto!");

        // Act
        CareEventDto dto = dtoConverter.toCareEventDto(event);

        // Assert
        assertNotNull(dto);
        assertEquals(500L, dto.getId());
        assertEquals(LocalDate.of(2025, 6, 1), dto.getProgrammedDate());
        assertEquals("ACQUA", dto.getType());
        assertTrue(dto.isCompleted());
        assertEquals(LocalDate.of(2025, 6, 1), dto.getCompletedDate());
        assertEquals("Fatto!", dto.getNotes());
    }

    /**
     * Verifica che toCareEventDto con null restituisca null.
     */
    @Test
    void toCareEventDto_Null_ReturnsNull() {
        assertNull(dtoConverter.toCareEventDto(null));
    }

    // ─── toPlantDto ──────────────────────────────────────────────────────────

    /**
     * Verifica la conversione Plant → PlantDto con eventi di cura.
     */
    @Test
    void toPlantDto_PlantWithCareEvents_MapsAllFieldsAndNextWatering() {
        // Arrange
        CareEvent waterEvent = new CareEvent();
        waterEvent.setId(600L);
        waterEvent.setType("ACQUA");
        waterEvent.setCompleted(false);
        waterEvent.setProgrammedDate(LocalDate.of(2025, 7, 1));

        CareEvent fertilizeEvent = new CareEvent();
        fertilizeEvent.setId(601L);
        fertilizeEvent.setType("CONCIME");
        fertilizeEvent.setCompleted(true);
        fertilizeEvent.setCompletedDate(LocalDate.of(2025, 6, 15));

        plant.setCareEvents(List.of(waterEvent, fertilizeEvent));

        // Act
        PlantDto dto = dtoConverter.toPlantDto(plant);

        // Assert
        assertNotNull(dto);
        assertEquals(100L, dto.getId());
        assertEquals("Verdino", dto.getName());
        assertEquals("http://verdino.jpg", dto.getUrlPhoto());
        assertEquals(LocalDate.of(2025, 3, 15), dto.getPurchaseDate());
        assertNull(dto.getDeathDate());
        assertNotNull(dto.getCard());
        assertEquals("Pothos", dto.getCard().getCommonName());
        assertEquals(LocalDate.of(2025, 7, 1), dto.getNextWateringDate());
        assertEquals(2, dto.getCareEvents().size());
    }

    /**
     * Verifica che toPlantDto senza eventi di cura non causi errori.
     */
    @Test
    void toPlantDto_NoCareEvents_NullNextWatering() {
        // Arrange
        plant.setCareEvents(null);

        // Act
        PlantDto dto = dtoConverter.toPlantDto(plant);

        // Assert
        assertNotNull(dto);
        assertNull(dto.getNextWateringDate());
        assertNull(dto.getCareEvents());
    }

    /**
     * Verifica che toPlantDto con null restituisca null.
     */
    @Test
    void toPlantDto_Null_ReturnsNull() {
        assertNull(dtoConverter.toPlantDto(null));
    }

    // ─── toGardenDto ─────────────────────────────────────────────────────────

    /**
     * Verifica la conversione Garden → GardenDto con piante.
     */
    @Test
    void toGardenDto_GardenWithPlants_MapsAllFields() {
        // Arrange
        plant.setCareEvents(null);
        garden.setPlants(List.of(plant));

        // Act
        GardenDto dto = dtoConverter.toGardenDto(garden);

        // Assert
        assertNotNull(dto);
        assertEquals(20L, dto.getId());
        assertEquals("Giardino di Mario", dto.getName());
        assertEquals(1L, dto.getOwnerId());
        assertEquals("Mario Rossi", dto.getOwnerName());
        assertEquals(1, dto.getPlants().size());
        assertEquals(100L, dto.getPlants().get(0).getId());
    }

    /**
     * Verifica che toGardenDto senza piante non causi errori.
     */
    @Test
    void toGardenDto_NoPlants_EmptyPlantsList() {
        // Arrange
        garden.setPlants(null);

        // Act
        GardenDto dto = dtoConverter.toGardenDto(garden);

        // Assert
        assertNotNull(dto);
        assertNull(dto.getPlants());
    }

    /**
     * Verifica che toGardenDto con null restituisca null.
     */
    @Test
    void toGardenDto_Null_ReturnsNull() {
        assertNull(dtoConverter.toGardenDto(null));
    }

    // ─── toPostDto ───────────────────────────────────────────────────────────

    /**
     * Verifica la conversione Post → PostDto con like e commenti.
     */
    @Test
    void toPostDto_PostWithLikesAndComments_MapsAllFields() {
        // Arrange
        Post post = new Post();
        post.setId(200L);
        post.setTitle("Il mio Pothos");
        post.setDescription("Sta crescendo bene!");
        post.setURLPhoto("http://post.jpg");
        post.setCreationDate(LocalDateTime.of(2025, 6, 1, 12, 0));
        post.setAuthor(user);
        post.setPlant(plant);
        plant.setCareEvents(null);

        User liker = new User();
        liker.setId(3L);
        post.setLikedBy(new HashSet<>(Set.of(liker)));

        Comment comment = new Comment();
        comment.setId(700L);
        post.setComments(List.of(comment));

        // Act
        PostDto dto = dtoConverter.toPostDto(post);

        // Assert
        assertNotNull(dto);
        assertEquals(200L, dto.getId());
        assertEquals("Il mio Pothos", dto.getTitle());
        assertEquals("Sta crescendo bene!", dto.getDescription());
        assertEquals("http://post.jpg", dto.getURLPhoto());
        assertNotNull(dto.getAuthor());
        assertEquals(1L, dto.getAuthor().getId());
        assertEquals(1, dto.getLikesCount());
        assertEquals(1, dto.getCommentsCount());
        assertFalse(dto.isLikedByMe()); // Default
    }

    /**
     * Verifica che toPostDto con null restituisca null.
     */
    @Test
    void toPostDto_Null_ReturnsNull() {
        assertNull(dtoConverter.toPostDto(null));
    }

    // ─── toCommentDto ────────────────────────────────────────────────────────

    /**
     * Verifica la conversione Comment → CommentDto con like status.
     */
    @Test
    void toCommentDto_WithLikedByMe_SetsLikedByMeTrue() {
        // Arrange
        Comment comment = new Comment();
        comment.setId(700L);
        comment.setText("Bellissima pianta!");
        comment.setCreationDate(LocalDateTime.of(2025, 6, 1, 14, 30));
        comment.setAuthor(user);
        comment.setLikedBy(new HashSet<>(Set.of(user)));

        // Act
        CommentDto dto = dtoConverter.toCommentDto(comment, 1L);

        // Assert
        assertNotNull(dto);
        assertEquals(700L, dto.getId());
        assertEquals("Bellissima pianta!", dto.getText());
        assertEquals(1L, dto.getAuthorId());
        assertTrue(dto.isLikedByMe());
        assertEquals(1, dto.getLikesCount());
    }

    /**
     * Verifica che likedByMe sia false se l'utente non ha messo like.
     */
    @Test
    void toCommentDto_WithoutLikedByMe_SetsLikedByMeFalse() {
        // Arrange
        Comment comment = new Comment();
        comment.setId(700L);
        comment.setText("Commento");
        comment.setAuthor(user);
        comment.setLikedBy(new HashSet<>());

        // Act
        CommentDto dto = dtoConverter.toCommentDto(comment, 99L);

        // Assert
        assertFalse(dto.isLikedByMe());
    }

    /**
     * Verifica che il parentId venga mappato correttamente per le risposte.
     */
    @Test
    void toCommentDto_Reply_MapsParentId() {
        // Arrange
        Comment parent = new Comment();
        parent.setId(600L);

        Comment reply = new Comment();
        reply.setId(700L);
        reply.setText("Risposta");
        reply.setAuthor(user);
        reply.setParent(parent);
        reply.setLikedBy(new HashSet<>());

        // Act
        CommentDto dto = dtoConverter.toCommentDto(reply, null);

        // Assert
        assertEquals(600L, dto.getParentId());
    }

    /**
     * Verifica che toCommentDto con null restituisca null.
     */
    @Test
    void toCommentDto_Null_ReturnsNull() {
        assertNull(dtoConverter.toCommentDto(null, 1L));
    }
}
