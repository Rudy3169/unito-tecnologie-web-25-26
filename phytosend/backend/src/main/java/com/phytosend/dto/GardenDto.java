package com.phytosend.dto;

import lombok.Data;
import java.util.List;

@Data
public class GardenDto {
    private Long id;
    private String name;
    private Long ownerId;
    private String ownerName;
    private List<PlantDto> plants;
}
