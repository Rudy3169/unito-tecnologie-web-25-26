package com.phytosend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank(message = "Il nome è obbligatorio")
    private String name;

    @NotBlank(message = "Il cognome è obbligatorio")
    private String surname;

    private String birthDate;
    private String city;

    @Column(unique = true)
    private String phoneNumber;

    @Column(unique = true)
    @Email(message = "Email non valida")
    @NotBlank(message = "L'email è obbligatoria")
    private String email;

    @NotBlank(message = "La password è obbligatoria")
    @Size(min = 6, message = "La password deve avere almeno 6 caratteri")
    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    // RELAZIONE: ogni utente ha un solo giardino
    @OneToOne(mappedBy = "owner", cascade = CascadeType.ALL)
    private Garden garden;
}