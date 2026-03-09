package com.phytosend.dto.perenual;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class PerenualImageDto {

    @JsonProperty("original_url")
    private String originalUrl;

    @JsonProperty("regular_url")
    private String regularUrl;

    @JsonProperty("medium_url")
    private String mediumUrl;

    @JsonProperty("small_url")
    private String smallUrl;
    
    @JsonProperty("thumbnail")
    private String thumbnail;
}
