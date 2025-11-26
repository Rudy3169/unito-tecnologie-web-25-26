package com.phytosend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String surname;
    private String birthDate;
    private String city;

    @Column(unique = true)
    private String phoneNumber;

    @Column(unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    // RELAZIONE: ogni utente ha un solo giardino
    @OneToOne(mappedBy = "owner", cascade = CascadeType.ALL)
    private Garden garden;
}