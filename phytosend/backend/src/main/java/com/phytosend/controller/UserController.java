package com.phytosend.controller;

import com.phytosend.dto.UserDto;
import com.phytosend.entity.User;
import com.phytosend.service.DtoConverter;
import com.phytosend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/utenti")
// @CrossOrigin rimosso: gestito globalmente in SecurityConfig
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private DtoConverter dtoConverter;

    // Route 1: GET tutti gli utenti
    @GetMapping
    public List<UserDto> getUsers() {
        return userService.findAll().stream()
                .map(dtoConverter::toUserDto)
                .collect(Collectors.toList());
    }

    // Route 2: POST crea utente
    // La registrazione è gestita da AuthController per restituire il token
    // Manteniamo questo metodo ma suggeriamo di usare /api/auth/register
    @PostMapping
    public UserDto createUser(@Valid @RequestBody User user) {
        User createdUser = userService.registerUser(user);
        return dtoConverter.toUserDto(createdUser);
    }
}