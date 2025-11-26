package com.phytosend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
@Table(name = "plants")
public class Plant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String urlPhoto;

    private LocalDate purchaseDate;

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