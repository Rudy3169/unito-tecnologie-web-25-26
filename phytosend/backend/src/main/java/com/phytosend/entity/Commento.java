package com.phytosend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "commenti")
public class Commento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String testo;
    private LocalDateTime dataCreazione;

    // RELAZIONI
    // Ogni commento ha un autore (utente)
    @ManyToOne
    @JoinColumn(name = "utente_id")
    private Utente autore;

    // Ogni commento appartiene a un post
    @ManyToOne
    @JoinColumn(name = "post_id")
    @JsonIgnore // Evita il loop infinito JSON
    private Post post;
}