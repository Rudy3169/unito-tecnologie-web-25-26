package com.phytosend.dto;

import com.phytosend.entity.NotificationType;
import lombok.Data;

/**
 * DTO per la risposta della Notifica
 */
@Data
public class NotificationDto {

    private Long id;

    // Info sull'attore
    private Long actorId;
    private String actorName;
    private String actorProfilePhotoUrl;

    // Tipo e riferimenti
    private NotificationType type;
    private Long referenceId; // ID del post
    private Long secondaryReferenceId; // ID del commento
    private Long postAuthorId; // ID dell'autore del post commentato

    // Contenuto
    private String message;
    private boolean isRead;
    private String createdAt;
}
