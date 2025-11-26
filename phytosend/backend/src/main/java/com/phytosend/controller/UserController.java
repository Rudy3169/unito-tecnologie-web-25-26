package com.phytosend.controller;

import com.phytosend.entity.User;
import com.phytosend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utenti")
@CrossOrigin(origins = "http://localhost:5173") // Permette a Vite/React di chiamare il backend
public class UserController {

    @Autowired
    private UserService userService;

    // Route 1: GET tutti gli utenti
    @GetMapping
    public List<User> getUsers() {
        return userService.findAll();
    }

    // Route 2: POST crea utente
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.registerUser(user);
    }
}