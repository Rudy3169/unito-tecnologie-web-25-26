package com.phytosend.dto.perenual;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class PerenualListResponse {

    @JsonProperty("data")
    private List<PerenualPlantDto> data;

    @JsonProperty("current_page")
    private int currentPage;
    
    @JsonProperty("last_page")
    private int lastPage;
    
    @JsonProperty("total")
    private long total;
}
