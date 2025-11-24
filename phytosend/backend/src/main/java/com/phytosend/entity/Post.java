package com.phytosend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titolo;
    private String descrizione;
    private String URLFoto;

    private LocalDateTime dataCreazione;

    // RELAZIONI
    // Ogni post ha un autore (utente)
    @ManyToOne
    @JoinColumn(name = "utente_id")
    private Utente autore;

    // Ogni post fa riferimento a una pianta
    @ManyToOne
    @JoinColumn(name = "pianta_id")
    private Pianta piantaRiferimento;

    // Ogni post può avere più commenti
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Commento> commenti;
}