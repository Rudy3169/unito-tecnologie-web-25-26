package com.phytosend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "gruppi")
public class Gruppo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;       // Es. "Scambio Talee"
    private String descrizione;
    private String paese;
    private String citta;

    // RELAZIONI
    // Ogni gruppo ha un solo admin
    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Utente admin;

    // Ogni gruppo ha più membri (utenti)
    @ManyToMany
    @JoinTable(
            name = "membri_gruppo",
            joinColumns = @JoinColumn(name = "gruppo_id"),
            inverseJoinColumns = @JoinColumn(name = "utente_id")
    )
    private List<Utente> membri;
}