package com.phytosend.dto;

import lombok.Data;
import java.time.LocalDate;

/**
 * DTO per la risposta della scheda botanica
 */
@Data
public class BotanicalCardDto {
    private Long id; // ID scheda botanica
    private String commonName; // Nome comune
    private String scientificName; // Nome scientifico
    private String family; // Famiglia
    private String exposure; // Esposizione
    private String irrigation; // Irrigazione
    private String waterFrequencyDays; // Frequenza irrigazione in giorni
    private String fertilization; // Concimazione
    private String soil; // Terreno
    private String urlDefaultPhoto; // URL foto default
    private LocalDate createdAt; // Data creazione
}