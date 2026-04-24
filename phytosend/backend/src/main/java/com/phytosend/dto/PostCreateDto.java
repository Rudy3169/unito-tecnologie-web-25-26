package com.phytosend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO per la richiesta di creazione di un post
 */
@Data
public class PostCreateDto {

    @NotBlank(message = "Il titolo è obbligatorio")
    private String title; // Titolo del post

    private String plantName; // Soprannome opzionale della pianta

    @NotBlank(message = "La descrizione è obbligatoria")
    private String description; // Descrizione del post

    private String urlPhoto; // URL della foto del post

    // ID scheda botanica presa dal catalogo
    private Long botanicalCardId;

    // ID pianta presa dal giardino
    private Long plantId;

    // Flag per indicare se la pianta deve essere aggiunta al giardino
    private boolean addToGarden;
}
