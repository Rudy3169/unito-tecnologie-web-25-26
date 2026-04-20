package com.phytosend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.Duration;

@Data
@Entity
@Table(name = "botanical_cards", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "common_name", "scientific_name" })
})
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

    @Column(length = 2048)
    private String urlDefaultPhoto;

    // Data di inserimento nel database
    @Column(name = "created_at", updatable = false)
    private java.time.LocalDate createdAt;

    // Metodo che scatta in automatico un millisecondo prima di salvare la pianta
    // nel DB
    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = java.time.LocalDate.now();
        }
    }

    // Metodo per verificare se la pianta è stata inserita oggi
    public boolean isRecent() {
        if (this.createdAt == null)
            return false;

        LocalDateTime now = LocalDateTime.now();

        return this.createdAt.equals(java.time.LocalDate.now());
    }
}