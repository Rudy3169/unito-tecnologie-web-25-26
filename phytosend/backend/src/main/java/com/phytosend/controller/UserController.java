package com.phytosend.controller;

import com.phytosend.dto.UserDto;
import com.phytosend.entity.Plant;
import com.phytosend.entity.User;
import com.phytosend.repository.PlantRepository;
import com.phytosend.repository.PostRepository;
import com.phytosend.repository.BotanicalCardRepository;
import com.phytosend.repository.CareEventRepository;
import com.phytosend.service.DtoConverter;
import com.phytosend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;

import java.time.LocalDate;

import jakarta.validation.Valid;

/**
 * Controller per la gestione degli utenti
 */
@RestController
@RequestMapping("/api/utenti")
public class UserController {

    // Servizio per la gestione degli utenti
    @Autowired
    private UserService userService;

    // Convertitore di DTO
    @Autowired
    private DtoConverter dtoConverter;

    // Repository per i post
    @Autowired
    private PostRepository postRepository;

    // Repository per le piante
    @Autowired
    private PlantRepository plantRepository;

    // Repository per le schede botaniche
    @Autowired
    private BotanicalCardRepository botanicalCardRepository;

    // Repository per gli eventi di cura
    @Autowired
    private CareEventRepository careEventRepository;

    /**
     * Recupera l'elenco di tutti gli utenti attualmente iscritti alla piattaforma
     * impaginati.
     *
     * @param page offset (default 0)
     * @param size fetch limit (default 10)
     * @return la pagina formattata come Data Transfer Objects (UserDto)
     */
    @GetMapping
    public org.springframework.data.domain.Page<UserDto> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return userService.findAll(page, size).map(dtoConverter::toUserDto);
    }

    /**
     * Recupera il profilo di un singolo utente con i contatori di post e piante.
     *
     * @param id ID dell'utente
     * @return profilo utente completo con statistiche
     */
    @GetMapping("/{id}")
    public UserDto getUser(@PathVariable @NonNull Long id) {
        // Trova l'utente tramite il servizio
        User user = userService.findById(id);

        // Converti l'utente in DTO
        UserDto dto = dtoConverter.toUserDto(user);

        // Calcola i contatori
        int postsCount = postRepository.findByAuthorIdOrderByCreationDateDesc(id).size();
        int plantsCount = (user.getGarden() != null && user.getGarden().getPlants() != null)
                ? user.getGarden().getPlants().size()
                : 0;

        // Imposta i contatori nel DTO
        dto.setPostsCount(postsCount);
        dto.setPlantsCount(plantsCount);

        return dto;
    }

    /**
     * Registra un nuovo utente.
     * (Preferibilmente utilizzare {@link AuthController#register(User)} per avere
     * un token).
     *
     * @param user il corpo richiesta JSON per generare un nuovo profilo nel sistema
     * @return profilo utente creato
     */
    @PostMapping
    public UserDto createUser(@Valid @RequestBody User user) {
        // Crea un nuovo utente tramite il servizio
        User createdUser = userService.registerUser(user);

        // Restituisci l'utente creato convertito in DTO
        return dtoConverter.toUserDto(createdUser);
    }

    /**
     * Aggiorna specifiche porzioni del profilo utente modificabili.
     * I campi sensibili (come password) ignorano questo endpoint.
     *
     * @param id          identificativo dell'utente nel DB
     * @param updatedData i nuovi dati modificabili inseriti dall'utente
     * @return i dati del profilo aggiornato in tempo reale
     */
    @PutMapping("/{id}")
    public UserDto updateUser(@PathVariable @NonNull Long id, @RequestBody User updatedData) {
        // Aggiorna il profilo utente tramite il servizio
        User updatedUser = userService.aggiornaProfilo(id, updatedData);

        // Restituisci il profilo aggiornato convertito in DTO
        return dtoConverter.toUserDto(updatedUser);
    }

    /**
     * Aggiunge una nuova pianta al giardino dell'utente
     * 
     * @param userId  ID dell'utente
     * @param payload JSON contenente l'ID della scheda botanica e il nome opzionale
     * @return ResponseEntity con codice 200 OK se l'operazione è andata a buon fine
     */
    @PostMapping("/{userId}/piante")
    public ResponseEntity<com.phytosend.dto.PlantDto> addPlantToGarden(
            @PathVariable Long userId,
            @RequestBody java.util.Map<String, String> payload) {

        // Trova l'utente
        User user = userService.findById(userId);

        // Trova la scheda botanica selezionata nel pop-up
        Long cardId = Long.parseLong(payload.get("botanicalCardId"));
        com.phytosend.entity.BotanicalCard card = botanicalCardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Scheda botanica non trovata"));

        // Crea la nuova pianta
        Plant newPlant = new Plant();
        newPlant.setPurchaseDate(LocalDate.now());
        newPlant.setDeathDate(null);
        newPlant.setCard(card);
        newPlant.setGarden(user.getGarden());

        // Se l'utente ha inserito un soprannome, lo salviamo
        if (payload.containsKey("plantName") && !payload.get("plantName").trim().isEmpty()) {
            newPlant.setName(payload.get("plantName"));
        }

        // Salva e restituisci il DTO
        Plant savedPlant = plantRepository.save(newPlant);
        return ResponseEntity.ok(dtoConverter.toPlantDto(savedPlant));
    }

    /**
     * Rinominare una pianta nel giardino dell'utente
     * 
     * @param userId  ID dell'utente
     * @param plantId ID della pianta
     * @param payload JSON contenente il nuovo nome della pianta
     * @return ResponseEntity con codice 200 OK se l'operazione è andata a buon fine
     */
    @PutMapping("/{userId}/piante/{plantId}/name")
    public ResponseEntity<?> renamePlant(@PathVariable Long userId, @PathVariable Long plantId,
            @RequestBody java.util.Map<String, String> payload) {

        // Cerca la pianta nel database
        Plant plant = plantRepository.findById(plantId)
                .orElseThrow(() -> new RuntimeException("Pianta non trovata"));

        // Aggiorna il nome estraendolo dal JSON inviato da React
        plant.setName(payload.get("newName"));
        plantRepository.save(plant);

        return ResponseEntity.ok().build();
    }

    /**
     * ELIMINA DEFINITIVAMENTE: Rimuove la pianta dal database per sempre
     * 
     * @param userId  ID dell'utente
     * @param plantId ID della pianta
     * @return ResponseEntity con codice 204 No Content se l'operazione è andata a
     *         buon fine
     */
    @DeleteMapping("/{userId}/piante/{plantId}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> deletePlantPermanently(@PathVariable Long userId, @PathVariable Long plantId) {
        // Cerca la pianta
        Plant plant = plantRepository.findById(plantId)
                .orElseThrow(() -> new RuntimeException("Pianta non trovata"));

        // La elimina fisicamente dal database (Hard Delete)
        plantRepository.delete(plant);

        return ResponseEntity.noContent().build(); // Ritorna 204 No Content (Successo)
    }

    /**
     * SEGNA COME MORTA: Sposta la pianta nel cimitero ma conserva i ricordi
     * 
     * @param userId  ID dell'utente
     * @param plantId ID della pianta
     * @return ResponseEntity con codice 200 OK se l'operazione è andata a buon fine
     */
    @PutMapping("/{userId}/piante/{plantId}/dead")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> markPlantAsDead(@PathVariable Long userId, @PathVariable Long plantId) {
        // Cerca la pianta
        Plant plant = plantRepository.findById(plantId)
                .orElseThrow(() -> new RuntimeException("Pianta non trovata"));

        // Cambia lo stato in "morta"
        plant.setDeathDate(LocalDate.now());
        plantRepository.save(plant);

        // Rimuove tutti gli eventi di cura pendenti (non completati) associati alla pianta
        careEventRepository.deleteByPlantIdAndCompletedFalse(plantId);

        return ResponseEntity.ok().build();
    }
}