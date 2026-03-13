package com.phytosend.controller;

import com.phytosend.dto.GardenDto;
import com.phytosend.entity.Garden;
import com.phytosend.service.DtoConverter;
import com.phytosend.service.GardenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gardens")
// @CrossOrigin rimosso: gestito globalmente in SecurityConfig
public class GardenController {

    @Autowired
    private GardenService gardenService;

    @Autowired
    private DtoConverter dtoConverter;

    // GET /api/gardens/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<GardenDto> getUserGarden(@PathVariable Long userId) {
        // Le eccezioni sono gestite da GlobalExceptionHandler
        Garden garden = gardenService.getGardenByUserId(userId);
        return ResponseEntity.ok(dtoConverter.toGardenDto(garden));
    }

    // POST /api/gardens/user/{userId}
    @PostMapping("/user/{userId}")
    public ResponseEntity<GardenDto> createGarden(@PathVariable Long userId, @RequestParam(defaultValue = "Il mio Giardino") String name) {
        Garden newGarden = gardenService.createGarden(userId, name);
        return ResponseEntity.ok(dtoConverter.toGardenDto(newGarden));
    }

    // PUT /api/gardens/{gardenId}
    @PutMapping("/{gardenId}")
    public ResponseEntity<GardenDto> updateGardenName(@PathVariable Long gardenId, @RequestBody String newName) {
        Garden updated = gardenService.updateGardenName(gardenId, newName);
        return ResponseEntity.ok(dtoConverter.toGardenDto(updated));
    }
}