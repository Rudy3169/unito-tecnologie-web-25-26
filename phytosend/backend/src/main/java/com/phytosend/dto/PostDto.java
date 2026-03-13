package com.phytosend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PostDto {
    private Long id;
    private String title;
    private String description;
    private String URLPhoto;
    private LocalDateTime creationDate;
    private UserDto author;
    private PlantDto plant;
}
