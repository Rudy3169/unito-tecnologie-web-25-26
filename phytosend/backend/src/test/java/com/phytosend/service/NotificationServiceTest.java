package com.phytosend.service;

import com.phytosend.entity.Notification;
import com.phytosend.entity.NotificationType;
import com.phytosend.entity.User;
import com.phytosend.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private DtoConverter dtoConverter;

    @InjectMocks
    private NotificationService notificationService;

    private User recipient;
    private User actor;

    @BeforeEach
    void setUp() {
        recipient = new User();
        recipient.setId(1L);
        recipient.setName("Mario");

        actor = new User();
        actor.setId(2L);
        actor.setName("Anna");
    }

    // ─── createNotification ──────────────────────────────────────────────────

    /**
     * Verifica che una notifica venga creata e salvata correttamente.
     */
    @Test
    void createNotification_DifferentUsers_SavesNotification() {
        // Act
        notificationService.createNotification(
                recipient, actor, NotificationType.LIKE_POST, 100L, 200L, "Anna ha messo mi piace");

        // Assert
        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());

        Notification saved = captor.getValue();
        assertEquals(recipient, saved.getRecipient());
        assertEquals(actor, saved.getActor());
        assertEquals(NotificationType.LIKE_POST, saved.getType());
        assertEquals(100L, saved.getReferenceId());
        assertEquals(200L, saved.getSecondaryReferenceId());
        assertEquals("Anna ha messo mi piace", saved.getMessage());
        assertFalse(saved.isRead());
        assertNotNull(saved.getCreatedAt());
    }

    /**
     * Verifica che NON venga creata una notifica se l'attore è lo stesso utente
     * del destinatario (auto-notifica).
     */
    @Test
    void createNotification_SameUser_DoesNotSave() {
        // Act
        notificationService.createNotification(
                recipient, recipient, NotificationType.COMMENT, 100L, null, "Messaggio");

        // Assert
        verify(notificationRepository, never()).save(any());
    }

    /**
     * Verifica che la notifica venga creata anche con actor null (notifica di
     * sistema).
     */
    @Test
    void createNotification_NullActor_SavesSystemNotification() {
        // Act
        notificationService.createNotification(
                recipient, null, NotificationType.CARE_WATER, 50L, 300L, "Pianta ha sete!");

        // Assert
        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        assertNull(captor.getValue().getActor());
        assertEquals(NotificationType.CARE_WATER, captor.getValue().getType());
    }

    /**
     * Verifica l'overload semplificato senza secondaryReferenceId.
     */
    @Test
    void createNotification_WithoutSecondaryRef_SavesWithNullSecondaryRef() {
        // Act
        notificationService.createNotification(
                recipient, actor, NotificationType.LIKE_POST, 100L, "Like!");

        // Assert
        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        assertNull(captor.getValue().getSecondaryReferenceId());
    }

    // ─── getUnreadCount ──────────────────────────────────────────────────────

    /**
     * Verifica il conteggio delle notifiche non lette.
     */
    @Test
    void getUnreadCount_ReturnsCorrectCount() {
        // Arrange
        when(notificationRepository.countByRecipientIdAndIsReadFalse(1L)).thenReturn(5L);

        // Act
        long count = notificationService.getUnreadCount(1L);

        // Assert
        assertEquals(5L, count);
    }

    // ─── getRecentNotifications ──────────────────────────────────────────────

    /**
     * Verifica che le notifiche recenti vengano convertite in DTO.
     */
    @Test
    void getRecentNotifications_ReturnsConvertedDtos() {
        // Arrange
        Notification n1 = new Notification();
        n1.setId(1L);

        com.phytosend.dto.NotificationDto dto1 = new com.phytosend.dto.NotificationDto();
        dto1.setId(1L);

        when(notificationRepository.findTop5ByRecipientIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(n1));
        when(dtoConverter.toNotificationDto(n1)).thenReturn(dto1);

        // Act
        var result = notificationService.getRecentNotifications(1L);

        // Assert
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }

    // ─── markAsRead ──────────────────────────────────────────────────────────

    /**
     * Verifica che una notifica venga segnata come letta.
     */
    @Test
    void markAsRead_ExistingNotification_SetsReadTrue() {
        // Arrange
        Notification notification = new Notification();
        notification.setId(10L);
        notification.setRead(false);

        when(notificationRepository.findById(10L)).thenReturn(Optional.of(notification));

        // Act
        notificationService.markAsRead(10L);

        // Assert
        assertTrue(notification.isRead());
        verify(notificationRepository).save(notification);
    }

    /**
     * Verifica che markAsRead con ID inesistente non lanci eccezioni.
     */
    @Test
    void markAsRead_NonExistingNotification_DoesNothing() {
        // Arrange
        when(notificationRepository.findById(999L)).thenReturn(Optional.empty());

        // Act - non deve lanciare eccezioni
        assertDoesNotThrow(() -> notificationService.markAsRead(999L));
        verify(notificationRepository, never()).save(any());
    }

    // ─── markAllAsRead ───────────────────────────────────────────────────────

    /**
     * Verifica che tutte le notifiche non lette vengano segnate come lette.
     */
    @Test
    void markAllAsRead_MultipleUnread_SetsAllReadTrue() {
        // Arrange
        Notification n1 = new Notification();
        n1.setId(1L);
        n1.setRead(false);

        Notification n2 = new Notification();
        n2.setId(2L);
        n2.setRead(false);

        when(notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(n1, n2));

        // Act
        notificationService.markAllAsRead(1L);

        // Assert
        assertTrue(n1.isRead());
        assertTrue(n2.isRead());
        verify(notificationRepository).saveAll(List.of(n1, n2));
    }

    /**
     * Verifica che markAllAsRead con nessuna notifica non letta non faccia nulla
     * di significativo.
     */
    @Test
    void markAllAsRead_NoUnread_SavesEmptyList() {
        // Arrange
        when(notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(1L))
                .thenReturn(List.of());

        // Act
        notificationService.markAllAsRead(1L);

        // Assert
        verify(notificationRepository).saveAll(List.of());
    }
}
