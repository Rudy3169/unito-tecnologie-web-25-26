package com.phytosend.entity;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Classe che rappresenta la scheda botanica di una pianta
 */
@Data
@Entity
@Table(name = "botanical_cards", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "common_name", "scientific_name" })
})
public class BotanicalCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // ID della scheda botanica

    private String commonName; // Nome comune
    private String scientificName; // Nome scientifico
    private String family; // Famiglia

    // Info di cura
    private String exposure; // Esposizione
    private String irrigation; // Irrigazione
    private String waterFrequencyDays; // Frequenza di irrigazione in giorni
    private String fertilization; // Fertilizzazione
    private String soil; // Terreno

    // URL foto di default
    @Column(length = 2048)
    private String urlDefaultPhoto;

    // Data di inserimento nel database
    @Column(name = "created_at", updatable = false)
    private java.time.LocalDate createdAt; // Data di creazione

    // Metodo che imposta la data di creazione automaticamente al momento della
    // creazione
    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = java.time.LocalDate.now();
        }
    }

    // Metodo che verifica se la scheda botanica è stata creata oggi
    public boolean isRecent() {
        if (this.createdAt == null)
            return false;

        return this.createdAt.equals(java.time.LocalDate.now());
    }
}