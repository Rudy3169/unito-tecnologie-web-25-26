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

    private String nome;       // Es. "Scambio Talee Torino"
    private String descrizione;
    private String zona;       // Es. "Torino Nord"

    // RELAZIONE: Chi ha creato il gruppo?
    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Utente admin;

    // RELAZIONE: Chi sono i membri? (ManyToMany genera una tabella di mezzo automatica)
    @ManyToMany
    @JoinTable(
            name = "membri_gruppo",
            joinColumns = @JoinColumn(name = "gruppo_id"),
            inverseJoinColumns = @JoinColumn(name = "utente_id")
    )
    private List<Utente> membri;
}