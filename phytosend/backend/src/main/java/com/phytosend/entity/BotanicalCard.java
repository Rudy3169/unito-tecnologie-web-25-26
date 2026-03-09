package com.phytosend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "botanical_cards")
public class BotanicalCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String commonName;
    private String scientificName;
    private String family;

    // Info di cura (statiche per la specie)
    private String exposure;
    private String irrigation;
    private int waterFrequencyDays;
    private String fertilization;
    private String soil;

    private String urlDefaultPhoto; // La foto "ufficiale" del catalogo
}