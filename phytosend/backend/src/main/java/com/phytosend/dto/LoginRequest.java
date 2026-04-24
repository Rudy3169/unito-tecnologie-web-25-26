package com.phytosend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO per la richiesta di login
 */
@Data
public class LoginRequest {
    @NotBlank(message = "L'email è obbligatoria")
    @Email(message = "Email non valida")
    private String email; // Email dell'utente

    @NotBlank(message = "La password è obbligatoria")
    private String password; // Password dell'utente
}
