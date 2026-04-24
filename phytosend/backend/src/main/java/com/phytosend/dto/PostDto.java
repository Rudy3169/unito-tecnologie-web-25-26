package com.phytosend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO per la risposta del post
 */
@Data
public class PostDto {
    private Long id; // ID del post
    private String title; // Titolo del post
    private String description; // Descrizione del post
    private String URLPhoto; // URL della foto del post
    private LocalDateTime creationDate; // Data di creazione del post
    private UserDto author; // Autore del post
    private PlantDto plant; // Pianta associata al post
    private int likesCount; // Numero di like al post
    private Integer commentsCount; // Numero di commenti al post

    // Flag per indicare se il post è piaciuto all'utente
    @JsonProperty("isLikedByMe")
    private boolean isLikedByMe;

    // Getter e Setter per commentsCount
    @JsonProperty("commentsCount")
    public Integer getCommentsCount() {
        return commentsCount;
    }

    @JsonProperty("commentsCount")
    public void setCommentsCount(Integer commentsCount) {
        this.commentsCount = commentsCount;
    }

    // Getter per plantId
    @JsonProperty("plantId")
    public Long getPlantId() {
        return plant.getId();
    }

    // Getter per plantName
    @JsonProperty("plantName")
    public String getPlantName() {
        return plant.getPlantName();
    }
}
