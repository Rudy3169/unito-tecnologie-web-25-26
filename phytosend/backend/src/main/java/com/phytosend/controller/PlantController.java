package com.phytosend.controller;

import com.phytosend.dto.PlantDto;
import com.phytosend.service.DtoConverter;
import com.phytosend.service.PlantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/utenti")
public class PlantController {
    @Autowired
    private PlantService plantService;

    @Autowired
    private DtoConverter dtoConverter;

    /**
     * Recupera l'elenco completo delle piante possedute da uno specifico utente nel suo giardino.
     *
     * @param utenteId identificativo dell'utente proprietario
     * @return una lista di piante formattate come stringhe DTO (Data Transfer Object)
     */
    @GetMapping("/{utenteId}/piante")
    public List<PlantDto> getPianteUtente(@PathVariable @NonNull Long utenteId) {
        return plantService.findPlant(utenteId).stream()
                .map(dtoConverter::toPlantDto)
                .collect(Collectors.toList());
    }

    /**
     * Elimina permanentemente una specifica pianta posseduta dall'utente.
     *
     * @param utenteId identificativo dell'utente proprietario del giardino
     * @param plantId identificativo della pianta da rimuovere
     * @return un responso vuoto (204 No Content) in caso di successo
     */
    @DeleteMapping("/{utenteId}/piante/{plantId}")
    public org.springframework.http.ResponseEntity<Void> removePlant(@PathVariable @NonNull Long utenteId, @PathVariable @NonNull Long plantId) {
        plantService.rimuoviPianta(plantId);
        return org.springframework.http.ResponseEntity.noContent().build();
    }
}
