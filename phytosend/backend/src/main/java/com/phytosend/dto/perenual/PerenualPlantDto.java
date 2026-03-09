package com.phytosend.dto.perenual;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class PerenualPlantDto {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("common_name")
    private String commonName;

    @JsonProperty("scientific_name")
    private List<String> scientificName;

    @JsonProperty("other_name")
    private List<String> otherName;

    @JsonProperty("cycle")
    private String cycle;

    @JsonProperty("watering")
    private String watering;

    @JsonProperty("sunlight")
    private List<String> sunlight;

    @JsonProperty("default_image")
    private PerenualImageDto defaultImage;
}
