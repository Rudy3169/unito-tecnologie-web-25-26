package com.phytosend.controller;

import com.phytosend.dto.PlantDto;
import com.phytosend.entity.Plant;
import com.phytosend.service.DtoConverter;
import com.phytosend.service.PlantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/utenti")
// @CrossOrigin rimosso: gestito globalmente in SecurityConfig
public class PlantController {
    @Autowired
    private PlantService plantService;

    @Autowired
    private DtoConverter dtoConverter;

    // Route 1: GET tutte le piante di un utente
    @GetMapping("/{utenteId}/piante")
    public List<PlantDto> getPianteUtente(@PathVariable Long utenteId) {
        return plantService.findPlant(utenteId).stream()
                .map(dtoConverter::toPlantDto)
                .collect(Collectors.toList());
    }
}
