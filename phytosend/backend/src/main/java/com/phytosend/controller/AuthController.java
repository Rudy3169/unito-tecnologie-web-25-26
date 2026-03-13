package com.phytosend.controller;

import com.phytosend.dto.LoginRequest;
import com.phytosend.dto.LoginResponse;
import com.phytosend.entity.User;
import com.phytosend.security.JwtUtil;
import com.phytosend.service.DtoConverter;
import com.phytosend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired; // Use Autowired for simplicity/consistency
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private DtoConverter dtoConverter;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        // Authenticate user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // If authentication successful, generate token
        UserDetails userDetails = userService.loadUserByUsername(request.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        // Fetch user data for response
        User user = userService.findByEmail(request.getEmail()); 
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(new LoginResponse(token, dtoConverter.toUserDto(user)));
    }
    
    @PostMapping("/register")
    // Note: Ensure User is valid
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody User user) {
        User createdUser = userService.registerUser(user);
        UserDetails userDetails = userService.loadUserByUsername(createdUser.getEmail());
        String token = jwtUtil.generateToken(userDetails);
        
        return ResponseEntity.ok(new LoginResponse(token, dtoConverter.toUserDto(createdUser)));
    }
}
