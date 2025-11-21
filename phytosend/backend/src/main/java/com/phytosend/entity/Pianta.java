package com.phytosend.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "piante")
public class Pianta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomeComune; // Es. "Ficus"
    private String soprannome; // Es. "Fuffy"
    private String specie;

    private LocalDate dataAcquisto;

    // Relazione con l'utente
    @ManyToOne
    @JoinColumn(name = "utente_id")
    private Utente proprietario;
}