package com.phytosend.controller;

import com.phytosend.dto.UserDto;
import com.phytosend.entity.User;
import com.phytosend.repository.PostRepository;
import com.phytosend.service.DtoConverter;
import com.phytosend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/utenti")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private DtoConverter dtoConverter;

    @Autowired
    private PostRepository postRepository;

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
        User user = userService.findById(id);
        UserDto dto = dtoConverter.toUserDto(user);

        // Calcola i contatori
        int postsCount = postRepository.findByAuthorIdOrderByCreationDateDesc(id).size();
        int plantsCount = (user.getGarden() != null && user.getGarden().getPlants() != null)
                ? user.getGarden().getPlants().size()
                : 0;

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
        User createdUser = userService.registerUser(user);
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
        User updatedUser = userService.aggiornaProfilo(id, updatedData);
        return dtoConverter.toUserDto(updatedUser);
    }
}