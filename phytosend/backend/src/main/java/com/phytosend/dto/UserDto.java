package com.phytosend.dto;

import com.phytosend.entity.UserRole;
import lombok.Data;

/**
 * DTO per la risposta del Profilo Utente
 */
@Data
public class UserDto {
    private Long id; // ID dell'utente
    private String name; // Nome dell'utente
    private String surname; // Cognome dell'utente
    private String email; // Email dell'utente
    private String phoneNumber; // Numero di telefono dell'utente
    private String city; // Città dell'utente
    private String bio; // Biografia dell'utente
    private String birthDate; // Data di nascita dell'utente
    private UserRole role; // Ruolo dell'utente
    private String profilePhotoUrl; // URL foto profilo dell'utente
    private int postsCount; // Numero di post dell'utente
    private int plantsCount; // Numero di piante dell'utente
}
