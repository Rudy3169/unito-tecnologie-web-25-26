package com.phytosend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "schede_botaniche")
public class SchedaBotanica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomeComune;
    private String nomeScientifico;
    private String famiglia;

    // Info di cura (statiche per la specie)
    private String esposizione;
    private String irrigazione;
    private int frequenzaAcquaGiorni;
    private String potatura;
    private String concimazione;
    private String rinvaso;
    private String terreno;

    @Column(length = 2000)
    private String utilizzi;

    private String urlFotoDefault; // La foto "ufficiale" del catalogo
}