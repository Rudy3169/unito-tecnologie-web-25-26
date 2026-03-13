package com.phytosend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PlantDto {
    private Long id;
    private String urlPhoto;
    private LocalDate purchaseDate;
    private Long botanicalCardId;
    private String botanicalCardName;
}
