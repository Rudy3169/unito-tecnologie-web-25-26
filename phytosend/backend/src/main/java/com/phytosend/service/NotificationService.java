package com.phytosend.service;

import com.phytosend.dto.NotificationDto;
import com.phytosend.entity.Notification;
import com.phytosend.entity.NotificationType;
import com.phytosend.entity.User;
import com.phytosend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Gestore per le Notifiche.
 */
@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private DtoConverter dtoConverter;

    /**
     * Crea e salva una nuova notifica.
     *
     * @param recipient            l'utente che riceve la notifica
     * @param actor                l'utente che ha compiuto l'azione (null per
     *                             sistema)
     * @param type                 tipo di notifica
     * @param referenceId          ID dell'entità principale di riferimento
     * @param secondaryReferenceId ID dell'entità secondaria (es. commentId)
     * @param message              testo della notifica
     */
    @Transactional
    public void createNotification(User recipient, User actor, NotificationType type,
            Long referenceId, Long secondaryReferenceId, String message) {
        // Non creare notifiche per se stessi
        if (actor != null && recipient.getId().equals(actor.getId())) {
            return;
        }

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setActor(actor);
        notification.setType(type);
        notification.setReferenceId(referenceId);
        notification.setSecondaryReferenceId(secondaryReferenceId);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        notificationRepository.save(notification);
    }

    /**
     * Overload semplificato senza secondaryReferenceId.
     */
    @Transactional
    public void createNotification(User recipient, User actor, NotificationType type,
            Long referenceId, String message) {
        createNotification(recipient, actor, type, referenceId, null, message);
    }

    /**
     * Restituisce il conteggio delle notifiche non lette per un utente.
     *
     * @param userId ID dell'utente
     * @return numero di notifiche non lette
     */
    public long getUnreadCount(@NonNull Long userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    /**
     * Restituisce le ultime 5 notifiche di un utente (per il dropdown).
     *
     * @param userId ID dell'utente
     * @return lista di NotificationDto
     */
    public List<NotificationDto> getRecentNotifications(@NonNull Long userId) {
        return notificationRepository.findTop5ByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(dtoConverter::toNotificationDto)
                .collect(Collectors.toList());
    }

    /**
     * Restituisce tutte le notifiche di un utente, paginate (per la
     * sidebar/storico).
     *
     * @param userId ID dell'utente
     * @param page   pagina
     * @param size   dimensione pagina
     * @return pagina di NotificationDto
     */
    public Page<NotificationDto> getAllNotifications(@NonNull Long userId, int page, int size) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .map(dtoConverter::toNotificationDto);
    }

    /**
     * Segna una notifica come letta.
     *
     * @param notificationId ID della notifica
     */
    @Transactional
    public void markAsRead(@NonNull Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    /**
     * Segna tutte le notifiche di un utente come lette.
     *
     * @param userId ID dell'utente
     */
    @Transactional
    public void markAllAsRead(@NonNull Long userId) {
        List<Notification> unread = notificationRepository
                .findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    /**
     * Verifica se esiste già una notifica per un tipo specifico e ID secondario.
     * 
     * @param type Tipo di notifica
     * @param secondaryReferenceId ID entità secondaria (es. ID evento di cura)
     * @return true se la notifica esiste già, false altrimenti
     */
    public boolean existsByTypeAndSecondaryReferenceId(NotificationType type, Long secondaryReferenceId) {
        return notificationRepository.existsByTypeAndSecondaryReferenceId(type, secondaryReferenceId);
    }
}
