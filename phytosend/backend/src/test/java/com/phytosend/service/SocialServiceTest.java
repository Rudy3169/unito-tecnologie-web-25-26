package com.phytosend.service;

import com.phytosend.dto.PostCreateDto;
import com.phytosend.dto.PostDto;
import com.phytosend.entity.*;
import com.phytosend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings({ "null" })
class SocialServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PlantRepository plantRepository;

    @Mock
    private BotanicalCardRepository botanicalCardRepository;

    @Mock
    private PlantService plantService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private DtoConverter dtoConverter;

    @InjectMocks
    private SocialService socialService;

    private User author;
    private User otherUser;
    private Post post;
    private Garden garden;

    @BeforeEach
    void setUp() {
        author = new User();
        author.setId(1L);
        author.setName("Mario");
        author.setSurname("Rossi");

        garden = new Garden();
        garden.setId(10L);
        garden.setOwner(author);
        author.setGarden(garden);

        otherUser = new User();
        otherUser.setId(2L);
        otherUser.setName("Anna");
        otherUser.setSurname("Verdi");

        post = new Post();
        post.setId(100L);
        post.setTitle("Il mio Pothos");
        post.setDescription("Sta crescendo bene!");
        post.setAuthor(author);
        post.setCreationDate(LocalDateTime.now());
        post.setLikedBy(new HashSet<>());
        post.setSavedBy(new HashSet<>());
        post.setComments(new ArrayList<>());
    }

    // ─── createPost ──────────────────────────────────────────────────────────

    /**
     * Verifica la creazione di un post semplice senza pianta associata.
     */
    @Test
    void createPost_WithoutPlant_SavesPostCorrectly() {
        // Arrange
        PostCreateDto dto = new PostCreateDto();
        dto.setTitle("Titolo");
        dto.setDescription("Descrizione");

        when(userRepository.findById(1L)).thenReturn(Optional.of(author));
        when(postRepository.save(any(Post.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Post result = socialService.createPost(1L, dto);

        // Assert
        assertNotNull(result);
        assertEquals("Titolo", result.getTitle());
        assertEquals("Descrizione", result.getDescription());
        assertEquals(author, result.getAuthor());
        assertNotNull(result.getCreationDate());
        verify(postRepository).save(any(Post.class));
    }

    /**
     * Verifica la creazione di un post con aggiunta di nuova pianta al giardino.
     */
    @Test
    void createPost_WithNewPlant_AddsPlantToGardenAndAssociates() {
        // Arrange
        PostCreateDto dto = new PostCreateDto();
        dto.setTitle("Nuova pianta");
        dto.setDescription("L'ho comprata oggi");
        dto.setBotanicalCardId(50L);
        dto.setAddToGarden(true);
        dto.setPlantName("Verdino");

        BotanicalCard card = new BotanicalCard();
        card.setId(50L);

        Plant newPlant = new Plant();
        newPlant.setId(200L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(author));
        when(botanicalCardRepository.findById(50L)).thenReturn(Optional.of(card));
        when(plantService.addPlantToGarden(author, card)).thenReturn(newPlant);
        when(postRepository.save(any(Post.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Post result = socialService.createPost(1L, dto);

        // Assert
        assertEquals(newPlant, result.getPlant());
        assertEquals("Verdino", newPlant.getName());
        verify(plantService).addPlantToGarden(author, card);
        verify(plantRepository).save(newPlant); // Salva il soprannome
    }

    /**
     * Verifica che associare una pianta esistente di un altro utente lanci
     * AccessDeniedException.
     */
    @Test
    void createPost_WithOtherUsersPlant_ThrowsAccessDeniedException() {
        // Arrange
        PostCreateDto dto = new PostCreateDto();
        dto.setTitle("Titolo");
        dto.setDescription("Descrizione");
        dto.setPlantId(300L);

        Garden otherGarden = new Garden();
        otherGarden.setOwner(otherUser);

        Plant otherPlant = new Plant();
        otherPlant.setId(300L);
        otherPlant.setGarden(otherGarden);

        when(userRepository.findById(1L)).thenReturn(Optional.of(author));
        when(plantRepository.findById(300L)).thenReturn(Optional.of(otherPlant));

        // Act & Assert
        assertThrows(AccessDeniedException.class, () -> socialService.createPost(1L, dto));
        verify(postRepository, never()).save(any());
    }

    /**
     * Verifica che un utente non trovato lanci eccezione.
     */
    @Test
    void createPost_UserNotFound_ThrowsRuntimeException() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());
        PostCreateDto dto = new PostCreateDto();
        dto.setTitle("T");
        dto.setDescription("D");

        // Act & Assert
        assertThrows(RuntimeException.class, () -> socialService.createPost(999L, dto));
    }

    // ─── toggleLike ──────────────────────────────────────────────────────────

    /**
     * Verifica che il like venga aggiunto se non presente e generi notifica.
     */
    @Test
    void toggleLike_AddLike_ReturnsTrueAndGeneratesNotification() {
        // Arrange
        when(postRepository.findById(100L)).thenReturn(Optional.of(post));
        when(userRepository.findById(2L)).thenReturn(Optional.of(otherUser));

        // Act
        boolean result = socialService.toggleLike(100L, 2L);

        // Assert
        assertTrue(result);
        assertTrue(post.getLikedBy().contains(otherUser));
        verify(postRepository).save(post);
        verify(notificationService).createNotification(
                eq(author), eq(otherUser), eq(NotificationType.LIKE_POST),
                eq(100L), anyString());
    }

    /**
     * Verifica che il like venga rimosso se già presente.
     */
    @Test
    void toggleLike_RemoveLike_ReturnsFalse() {
        // Arrange
        post.getLikedBy().add(otherUser);
        when(postRepository.findById(100L)).thenReturn(Optional.of(post));
        when(userRepository.findById(2L)).thenReturn(Optional.of(otherUser));

        // Act
        boolean result = socialService.toggleLike(100L, 2L);

        // Assert
        assertFalse(result);
        assertFalse(post.getLikedBy().contains(otherUser));
        verify(postRepository).save(post);
        verify(notificationService, never()).createNotification(
                any(), any(), any(), any(), anyString());
    }

    // ─── toggleCommentLike ───────────────────────────────────────────────────

    /**
     * Verifica che il like a un commento venga aggiunto correttamente.
     */
    @Test
    void toggleCommentLike_AddLike_ReturnsTrueAndNotifies() {
        // Arrange
        Comment comment = new Comment();
        comment.setId(500L);
        comment.setAuthor(author);
        comment.setPost(post);
        comment.setLikedBy(new HashSet<>());

        when(commentRepository.findById(500L)).thenReturn(Optional.of(comment));
        when(userRepository.findById(2L)).thenReturn(Optional.of(otherUser));

        // Act
        boolean result = socialService.toggleCommentLike(500L, 2L);

        // Assert
        assertTrue(result);
        assertTrue(comment.getLikedBy().contains(otherUser));
        verify(commentRepository).save(comment);
        verify(notificationService).createNotification(
                eq(author), eq(otherUser), eq(NotificationType.LIKE_COMMENT),
                eq(100L), eq(500L), anyString());
    }

    /**
     * Verifica che il like a un commento venga rimosso se già presente.
     */
    @Test
    void toggleCommentLike_RemoveLike_ReturnsFalse() {
        // Arrange
        Comment comment = new Comment();
        comment.setId(500L);
        comment.setAuthor(author);
        comment.setLikedBy(new HashSet<>(Set.of(otherUser)));

        when(commentRepository.findById(500L)).thenReturn(Optional.of(comment));
        when(userRepository.findById(2L)).thenReturn(Optional.of(otherUser));

        // Act
        boolean result = socialService.toggleCommentLike(500L, 2L);

        // Assert
        assertFalse(result);
        assertFalse(comment.getLikedBy().contains(otherUser));
    }

    // ─── addComment ──────────────────────────────────────────────────────────

    /**
     * Verifica che un commento top-level venga creato e notificato all'autore del
     * post.
     */
    @Test
    void addComment_TopLevel_SavesCommentAndNotifiesPostAuthor() {
        // Arrange
        when(postRepository.findById(100L)).thenReturn(Optional.of(post));
        when(userRepository.findById(2L)).thenReturn(Optional.of(otherUser));
        when(commentRepository.save(any(Comment.class))).thenAnswer(i -> {
            Comment c = i.getArgument(0);
            c.setId(600L);
            return c;
        });

        // Act
        Comment result = socialService.addComment(100L, 2L, "Bel post!", null);

        // Assert
        assertNotNull(result);
        assertEquals("Bel post!", result.getText());
        assertEquals(otherUser, result.getAuthor());
        assertEquals(post, result.getPost());
        verify(commentRepository).save(any(Comment.class));
        verify(notificationService).createNotification(
                eq(author), eq(otherUser), eq(NotificationType.COMMENT),
                eq(100L), eq(600L), anyString());
    }

    /**
     * Verifica che una risposta a un commento generi una notifica REPLY all'autore
     * del commento padre.
     */
    @Test
    void addComment_Reply_NotifiesParentCommentAuthor() {
        // Arrange
        Comment parentComment = new Comment();
        parentComment.setId(600L);
        parentComment.setAuthor(author);
        parentComment.setPost(post);

        when(postRepository.findById(100L)).thenReturn(Optional.of(post));
        when(userRepository.findById(2L)).thenReturn(Optional.of(otherUser));
        when(commentRepository.findById(600L)).thenReturn(Optional.of(parentComment));
        when(commentRepository.save(any(Comment.class))).thenAnswer(i -> {
            Comment c = i.getArgument(0);
            c.setId(700L);
            return c;
        });

        // Act
        Comment result = socialService.addComment(100L, 2L, "Risposta!", 600L);

        // Assert
        assertNotNull(result);
        assertEquals(parentComment, result.getParent());
        verify(notificationService).createNotification(
                eq(author), eq(otherUser), eq(NotificationType.REPLY),
                eq(100L), eq(700L), anyString());
    }

    // ─── deletePost ──────────────────────────────────────────────────────────

    /**
     * Verifica che l'autore possa eliminare il proprio post.
     */
    @Test
    void deletePost_ByAuthor_DeletesSuccessfully() {
        // Arrange
        when(postRepository.findById(100L)).thenReturn(Optional.of(post));

        // Act
        socialService.deletePost(100L, 1L);

        // Assert
        verify(postRepository).delete(post);
    }

    /**
     * Verifica che un utente non autore non possa eliminare il post.
     */
    @Test
    void deletePost_ByNonAuthor_ThrowsAccessDeniedException() {
        // Arrange
        when(postRepository.findById(100L)).thenReturn(Optional.of(post));

        // Act & Assert
        assertThrows(AccessDeniedException.class, () -> socialService.deletePost(100L, 2L));
        verify(postRepository, never()).delete(any());
    }

    // ─── deleteComment ───────────────────────────────────────────────────────

    /**
     * Verifica che l'autore del commento possa eliminare il proprio commento senza
     * risposte.
     */
    @Test
    void deleteComment_ByCommentAuthorWithoutReplies_DeletesSuccessfully() {
        // Arrange
        Comment comment = new Comment();
        comment.setId(500L);
        comment.setAuthor(otherUser);
        comment.setPost(post);

        when(commentRepository.findById(500L)).thenReturn(Optional.of(comment));
        when(commentRepository.findByParentId(500L)).thenReturn(Collections.emptyList());

        // Act
        socialService.deleteComment(100L, 500L, 2L);

        // Assert
        verify(commentRepository).delete(comment);
    }

    /**
     * Verifica che l'autore di un commento NON possa eliminarlo se ha risposte
     * (e non è anche l'autore del post).
     */
    @Test
    void deleteComment_ByCommentAuthorWithReplies_ThrowsForbidden() {
        // Arrange
        Comment comment = new Comment();
        comment.setId(500L);
        comment.setAuthor(otherUser);
        comment.setPost(post);

        Comment reply = new Comment();
        reply.setId(501L);

        when(commentRepository.findById(500L)).thenReturn(Optional.of(comment));
        when(commentRepository.findByParentId(500L)).thenReturn(List.of(reply));

        // Act & Assert
        assertThrows(org.springframework.web.server.ResponseStatusException.class,
                () -> socialService.deleteComment(100L, 500L, 2L));
        verify(commentRepository, never()).delete(any());
    }

    /**
     * Verifica che l'autore del post possa eliminare qualsiasi commento
     * (anche con risposte).
     */
    @Test
    void deleteComment_ByPostAuthor_DeletesWithReplies() {
        // Arrange
        Comment comment = new Comment();
        comment.setId(500L);
        comment.setAuthor(otherUser);
        comment.setPost(post);

        Comment reply = new Comment();
        reply.setId(501L);

        when(commentRepository.findById(500L)).thenReturn(Optional.of(comment));
        when(commentRepository.findByParentId(500L)).thenReturn(List.of(reply));

        // Act
        socialService.deleteComment(100L, 500L, 1L); // 1L = autore del post

        // Assert
        verify(commentRepository).deleteAll(List.of(reply));
        verify(commentRepository).delete(comment);
    }

    /**
     * Verifica che un utente estraneo non possa eliminare un commento.
     */
    @Test
    void deleteComment_ByUnrelatedUser_ThrowsForbidden() {
        // Arrange
        User thirdUser = new User();
        thirdUser.setId(3L);

        Comment comment = new Comment();
        comment.setId(500L);
        comment.setAuthor(otherUser);
        comment.setPost(post);

        when(commentRepository.findById(500L)).thenReturn(Optional.of(comment));

        // Act & Assert
        assertThrows(org.springframework.web.server.ResponseStatusException.class,
                () -> socialService.deleteComment(100L, 500L, 3L));
    }

    // ─── toggleSavePost ──────────────────────────────────────────────────────

    /**
     * Verifica che il salvataggio di un post funzioni come toggle.
     */
    @Test
    void toggleSavePost_Save_ReturnsTrue() {
        // Arrange
        when(postRepository.findById(100L)).thenReturn(Optional.of(post));
        when(userRepository.findById(2L)).thenReturn(Optional.of(otherUser));

        // Act
        boolean result = socialService.toggleSavePost(100L, 2L);

        // Assert
        assertTrue(result);
        assertTrue(post.getSavedBy().contains(otherUser));
        verify(postRepository).save(post);
    }

    /**
     * Verifica che il toggle rimuova il salvataggio se già salvato.
     */
    @Test
    void toggleSavePost_Unsave_ReturnsFalse() {
        // Arrange
        post.getSavedBy().add(otherUser);
        when(postRepository.findById(100L)).thenReturn(Optional.of(post));
        when(userRepository.findById(2L)).thenReturn(Optional.of(otherUser));

        // Act
        boolean result = socialService.toggleSavePost(100L, 2L);

        // Assert
        assertFalse(result);
        assertFalse(post.getSavedBy().contains(otherUser));
    }

    // ─── getSavedPosts ───────────────────────────────────────────────────────

    /**
     * Verifica che vengano restituiti i post salvati con il flag savedByMe a true.
     */
    @Test
    void getSavedPosts_ReturnsPostsWithSavedByMeTrue() {
        // Arrange
        PostDto postDto = new PostDto();
        postDto.setId(100L);

        when(postRepository.findBySavedByIdOrderByCreationDateDesc(2L)).thenReturn(List.of(post));
        when(dtoConverter.toPostDto(post)).thenReturn(postDto);

        // Act
        List<PostDto> result = socialService.getSavedPosts(2L);

        // Assert
        assertEquals(1, result.size());
        assertTrue(result.get(0).isSavedByMe());
    }

    // ─── getPostLikes ────────────────────────────────────────────────────────

    /**
     * Verifica che la lista dei like restituisca gli utenti corretti.
     */
    @Test
    void getPostLikes_ReturnsListOfUsers() {
        // Arrange
        post.getLikedBy().add(otherUser);
        com.phytosend.dto.UserDto userDto = new com.phytosend.dto.UserDto();
        userDto.setId(2L);

        when(postRepository.findById(100L)).thenReturn(Optional.of(post));
        when(dtoConverter.toUserDto(otherUser)).thenReturn(userDto);

        // Act
        var result = socialService.getPostLikes(100L);

        // Assert
        assertEquals(1, result.size());
        assertEquals(2L, result.get(0).getId());
    }

    /**
     * Verifica che la lista dei like sia vuota se nessuno ha messo like.
     */
    @Test
    void getPostLikes_NoLikes_ReturnsEmptyList() {
        // Arrange
        post.setLikedBy(null);
        when(postRepository.findById(100L)).thenReturn(Optional.of(post));

        // Act
        var result = socialService.getPostLikes(100L);

        // Assert
        assertTrue(result.isEmpty());
    }
}
