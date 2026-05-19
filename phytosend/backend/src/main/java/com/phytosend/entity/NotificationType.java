package com.phytosend.entity;

/**
 * Enum che rappresenta i Tipi di Notifica supportati dal sistema.
 */
public enum NotificationType {
    LIKE_POST, // Like a un post
    COMMENT, // Commento a un post
    REPLY, // Risposta a un commento
    LIKE_COMMENT, // Like a un commento
    CARE_WATER // Evento irrigazione in scadenza/scaduto
}
