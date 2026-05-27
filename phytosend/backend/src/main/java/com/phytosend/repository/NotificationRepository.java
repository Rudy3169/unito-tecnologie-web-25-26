package com.phytosend.repository;

import com.phytosend.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Interfaccia Repository per le Notifiche
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Conta le notifiche non lette di un utente (per il badge).
     */
    long countByRecipientIdAndIsReadFalse(Long recipientId);

    /**
     * Trova le ultime 5 notifiche di un utente (per il dropdown).
     */
    List<Notification> findTop5ByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    /**
     * Trova tutte le notifiche di un utente, paginate (per la sidebar/storico).
     */
    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    /**
     * Trova tutte le notifiche non lette di un utente.
     */
    List<Notification> findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(Long recipientId);

    /**
     * Verifica se esiste già una notifica di un certo tipo per un'entità secondaria.
     */
    boolean existsByTypeAndSecondaryReferenceId(com.phytosend.entity.NotificationType type, Long secondaryReferenceId);
}
