package com.phytosend.controller;

import com.phytosend.dto.PlantDto;
import com.phytosend.service.DtoConverter;
import com.phytosend.service.PlantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller per la gestione delle Piante.
 * Le operazioni di modifica (POST, PUT, DELETE) sono gestite da UserController.
 */
@RestController
@RequestMapping("/api/utenti")
public class PlantController {

    // Servizio per la gestione delle piante
    @Autowired
    private PlantService plantService;

    // Convertitore di DTO
    @Autowired
    private DtoConverter dtoConverter;

    /**
     * Recupera l'elenco completo delle piante possedute da uno specifico utente nel
     * suo giardino.
     *
     * @param utenteId identificativo dell'utente proprietario
     * @return una lista di piante formattate come stringhe DTO (Data Transfer
     *         Object)
     */
    @GetMapping("/{utenteId}/piante")
    public List<PlantDto> getPianteUtente(@PathVariable @NonNull Long utenteId) {
        return plantService.findPlant(utenteId).stream()
                .map(dtoConverter::toPlantDto)
                .collect(Collectors.toList());
    }
}
