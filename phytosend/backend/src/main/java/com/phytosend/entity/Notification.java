package com.phytosend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Classe che rappresenta una notifica nel sistema.
 * Gestisce sia notifiche social (like, commenti) che di sistema (eventi cura piante).
 */
@Data
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // ID notifica

    // Chi riceve la notifica
    @ManyToOne
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    // Chi ha fatto l'azione (null per notifiche di sistema)
    @ManyToOne
    @JoinColumn(name = "actor_id")
    private User actor;

    // Tipo di notifica
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    // ID dell'entità di riferimento principale (post, pianta)
    private Long referenceId;

    // ID dell'entità di riferimento secondaria (commento, per navigazione)
    private Long secondaryReferenceId;

    // Testo leggibile della notifica
    @Column(length = 500)
    private String message;

    // Stato di lettura
    @Column(nullable = false)
    private boolean isRead = false;

    // Timestamp di creazione
    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Imposta automaticamente il timestamp di creazione
    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
