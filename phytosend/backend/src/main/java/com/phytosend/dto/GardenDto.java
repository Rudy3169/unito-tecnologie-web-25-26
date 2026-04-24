package com.phytosend.dto;

import lombok.Data;
import java.util.List;

/**
 * DTO per la risposta del giardino
 */
@Data
public class GardenDto {
    private Long id; // ID del giardino
    private String name; // Nome del giardino
    private Long ownerId; // ID del proprietario
    private String ownerName; // Nome del proprietario
    private List<PlantDto> plants; // Lista delle piante nel giardino
}
