package com.phytosend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "utenti")
public class Utente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String cognome;
    private String compleanno;
    private String citta;

    @Column(unique = true)
    private String cellulare;

    @Column(unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private RuoloUtente ruolo;

    // RELAZIONE: ogni utente ha un solo giardino
    @OneToOne(mappedBy = "proprietario", cascade = CascadeType.ALL)
    private Giardino giardino;
}