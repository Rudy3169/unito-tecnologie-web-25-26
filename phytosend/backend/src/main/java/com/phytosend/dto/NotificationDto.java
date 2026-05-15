package com.phytosend.dto;

import com.phytosend.entity.NotificationType;
import lombok.Data;

/**
 * Data Transfer Object per le notifiche.
 * Contiene solo i dati necessari al frontend.
 */
@Data
public class NotificationDto {

    private Long id;

    // Info sull'attore (chi ha fatto l'azione)
    private Long actorId;
    private String actorName;
    private String actorProfilePhotoUrl;

    // Tipo e riferimenti
    private NotificationType type;
    private Long referenceId;
    private Long secondaryReferenceId;
    private Long postAuthorId; // Aggiunto per permettere al frontend di navigare al profilo corretto

    // Contenuto
    private String message;
    private boolean isRead;
    private String createdAt;
}
