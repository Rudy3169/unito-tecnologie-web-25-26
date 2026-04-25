package com.phytosend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Classe che rappresenta una pianta
 */
@Data
@Entity
@Table(name = "plants")
public class Plant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // ID della pianta

    private String name; // Soprannome personale della pianta

    private String urlPhoto; // URL della foto

    private LocalDate purchaseDate; // Data di acquisto

    private LocalDate deathDate; // Data di morte

    // RELAZIONI
    // Ogni pianta appartiene a un giardino
    @ManyToOne
    @JoinColumn(name = "garden_id")
    @JsonIgnore
    private Garden garden;

    // Ogni pianta ha una scheda botanica
    @ManyToOne
    @JoinColumn(name = "botanical_card_id")
    private BotanicalCard card;
}