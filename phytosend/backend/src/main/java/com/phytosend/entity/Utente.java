package com.phytosend.entity;

import jakarta.persistence.*;
import lombok.Data; // Genera getter, setter, toString, ecc.
import java.util.List;

@Data
@Entity
@Table(name = "utenti")
public class Utente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String cognome;

    @Column(unique = true)
    private String email;

    private String password; // In un progetto reale andrebbe hashata!

    // Requisito: 2 tipologie di utenti
    @Enumerated(EnumType.STRING)
    private RuoloUtente ruolo; // Definisci un enum con BASE, ESPERTO

    // Relazione: Un utente ha molte piante
    @OneToMany(mappedBy = "proprietario", cascade = CascadeType.ALL)
    private List<Pianta> piante;
}