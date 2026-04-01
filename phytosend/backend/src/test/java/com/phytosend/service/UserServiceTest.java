package com.phytosend.service;

import com.phytosend.entity.User;
import com.phytosend.entity.UserRole;
import com.phytosend.exception.ResourceNotFoundException;
import com.phytosend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setName("Mario");
        user.setSurname("Rossi");
        user.setEmail("mario.rossi@example.com");
        user.setPassword("password123");
    }

    // ─── registerUser ─────────────────────────────────────────────────────────

    /**
     * Caso felice: utente nuovo → password hashata, ruolo BASE assegnato di default,
     * giardino creato e associato automaticamente.
     */
    @Test
    @SuppressWarnings("null")
    void registerUser_NewUser_AssignsDefaultRoleAndCreatesGarden() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        User registered = userService.registerUser(user);

        // Assert
        assertNotNull(registered);
        assertEquals("encodedPassword", registered.getPassword());
        assertEquals(UserRole.BASE, registered.getRole());
        assertNotNull(registered.getGarden());
        assertEquals(registered, registered.getGarden().getOwner());
        verify(userRepository).save(any(User.class));
    }

    /**
     * Se il ruolo è già impostato (es. ADMIN da seeder), deve essere preservato e non sovrascritto con BASE.
     */
    @Test
    void registerUser_WithPresetRole_PreservesGivenRole() {
        // Arrange
        user.setRole(UserRole.ADMIN);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        User registered = userService.registerUser(user);

        // Assert: il ruolo deve rimanere ADMIN, non essere ribaltato a BASE
        assertEquals(UserRole.ADMIN, registered.getRole());
    }

    /**
     * Email già registrata → deve essere lanciata RuntimeException senza salvare nulla.
     */
    @Test
    void registerUser_DuplicateEmail_ThrowsExceptionWithoutSaving() {
        // Arrange
        when(userRepository.existsByEmail(user.getEmail())).thenReturn(true);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> userService.registerUser(user));
        verify(userRepository, never()).save(any());
    }

    // ─── login ────────────────────────────────────────────────────────────────

    /**
     * Credenziali corrette → login restituisce l'utente corrispondente.
     */
    @Test
    void login_CorrectCredentials_ReturnsUser() {
        // Arrange
        user.setPassword("hashed_password");
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed_password")).thenReturn(true);

        // Act
        User loggedIn = userService.login(user.getEmail(), "password123");

        // Assert
        assertNotNull(loggedIn);
        assertEquals(user.getEmail(), loggedIn.getEmail());
    }

    /**
     * Password sbagliata → RuntimeException, l'utente non viene restituito.
     */
    @Test
    void login_WrongPassword_ThrowsRuntimeException() {
        // Arrange
        user.setPassword("hashed_password");
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> userService.login(user.getEmail(), "wrongpass"));
    }

    /**
     * Email non registrata → RuntimeException perché l'Optional è vuoto.
     */
    @Test
    void login_UnknownEmail_ThrowsRuntimeException() {
        // Arrange
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> userService.login("ghost@example.com", "any"));
    }

    // ─── findById ────────────────────────────────────────────────────────────

    /**
     * ID esistente → restituisce l'utente corretto.
     */
    @Test
    void findById_ExistingId_ReturnsUser() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        // Act
        User found = userService.findById(1L);

        // Assert
        assertNotNull(found);
        assertEquals(1L, found.getId());
        assertEquals("Mario", found.getName());
    }

    /**
     * ID non esistente → ResourceNotFoundException.
     */
    @Test
    void findById_NonExistingId_ThrowsResourceNotFoundException() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> userService.findById(999L));
    }

    // ─── aggiornaProfilo ──────────────────────────────────────────────────────

    /**
     * Aggiornamento profilo: solo città e telefono vengono modificati,
     * gli altri campi (nome, email) restano invariati.
     */
    @Test
    void aggiornaProfilo_UpdatesCityAndPhoneOnly() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User updatedData = new User();
        updatedData.setCity("Torino");
        updatedData.setPhoneNumber("3331234567");

        // Act
        User updated = userService.aggiornaProfilo(1L, updatedData);

        // Assert: solo città e telefono cambiano
        assertEquals("Torino", updated.getCity());
        assertEquals("3331234567", updated.getPhoneNumber());
        // Il nome originale deve rimanere invariato
        assertEquals("Mario", updated.getName());
        verify(userRepository).save(user);
    }

    // ─── changeRole / Upgrade ─────────────────────────────────────────────────

    /**
     * Cambio ruolo: il metodo deve aggiornare il ruolo dell'utente e salvare.
     */
    @Test
    void changeRole_ChangesUserRoleCorrectly() {
        // Arrange
        user.setRole(UserRole.BASE);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        User upgraded = userService.changeRole(1L, UserRole.PRO);

        // Assert
        assertEquals(UserRole.PRO, upgraded.getRole());
        verify(userRepository).save(user);
    }

    /**
     * Upgrade(): shortcut per promuovere a PRO — verifica che il ruolo risultante sia PRO.
     */
    @Test
    void upgrade_PromotesUserToPro() {
        // Arrange
        user.setRole(UserRole.BASE);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        User result = userService.Upgrade(1L);

        // Assert
        assertEquals(UserRole.PRO, result.getRole());
    }

    /**
     * findAll() restituisce la lista completa degli utenti presenti nel DB.
     */
    @Test
    void findAll_ReturnsAllUsers() {
        // Arrange
        User user2 = new User();
        user2.setId(2L);
        user2.setEmail("anna@example.com");
        when(userRepository.findAll()).thenReturn(List.of(user, user2));

        // Act
        List<User> users = userService.findAll();

        // Assert
        assertEquals(2, users.size());
        assertTrue(users.contains(user));
        assertTrue(users.contains(user2));
    }
}
