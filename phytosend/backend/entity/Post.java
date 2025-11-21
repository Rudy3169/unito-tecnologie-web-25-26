package com.phytosend.backend.entity;

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
    private String testo;
    private String fotoUrl; // Per ora salviamo solo l'URL o il nome del file
    private String tag;     // Es. "SOS", "Crescita", "Info"

    private LocalDateTime dataCreazione;

    // RELAZIONE: Chi ha scritto il post?
    @ManyToOne
    @JoinColumn(name = "utente_id")
    private Utente autore;

    // RELAZIONE: Di quale pianta si parla? (Opzionale)
    @ManyToOne
    @JoinColumn(name = "pianta_id")
    private Pianta piantaRiferimento;

    // RELAZIONE: I commenti sotto questo post
    // JsonIgnore evita che quando scarichi un post, scarichi i commenti, che scaricano il post... (loop infinito)
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private List<Commento> commenti;
}