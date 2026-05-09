package com.phytosend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Classe che rappresenta un utente
 */
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id; // ID utente

    @NotBlank(message = "Il nome è obbligatorio")
    private String name; // Nome

    @NotBlank(message = "Il cognome è obbligatorio")
    private String surname; // Cognome

    private String birthDate; // Data di nascita
    private String city; // Città

    @Column(unique = true)
    private String phoneNumber; // Numero di telefono

    @Column(unique = true)
    @Email(message = "Email non valida")
    @NotBlank(message = "L'email è obbligatoria")
    private String email; // Email

    @NotBlank(message = "La password è obbligatoria")
    @Size(min = 6, message = "La password deve avere almeno 6 caratteri")
    private String password; // Password

    @Column(length = 300)
    private String bio; // Biografia

    @Column(columnDefinition = "TEXT")
    private String profilePhotoUrl; // URL foto profilo

    @Enumerated(EnumType.STRING)
    private UserRole role; // Ruolo

    // RELAZIONE: ogni utente ha un solo giardino
    @OneToOne(mappedBy = "owner", cascade = CascadeType.ALL)
    private Garden garden;
}