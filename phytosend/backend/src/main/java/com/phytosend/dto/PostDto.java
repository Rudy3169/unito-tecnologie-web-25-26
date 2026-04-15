package com.phytosend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class PostDto {
    private Long id;
    private String title;
    private String description;
    private String URLPhoto;
    private LocalDateTime creationDate;
    private UserDto author;
    private PlantDto plant;
    private int likesCount;
    @JsonProperty("isLikedByMe")
    private boolean isLikedByMe;
}
