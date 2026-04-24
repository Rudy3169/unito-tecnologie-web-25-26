package com.phytosend.dto;

import lombok.Data;
import java.time.LocalDate;

/**
 * DTO per la risposta della pianta
 */
@Data
public class PlantDto {
    private Long id; // ID della pianta
    private String name; // Soprannome opzionale della pianta
    private String urlPhoto; // URL della foto della pianta
    private LocalDate purchaseDate; // Data di acquisto della pianta
    private BotanicalCardDto card; // Scheda botanica della pianta
}
