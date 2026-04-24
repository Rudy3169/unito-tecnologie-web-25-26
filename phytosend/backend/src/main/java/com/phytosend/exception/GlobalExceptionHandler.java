package com.phytosend.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.validation.FieldError;

import java.util.HashMap;
import java.util.Map;
import java.time.LocalDateTime;

/**
 * Gestore globale delle eccezioni per l'applicazione
 */
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Gestisce le eccezioni di tipo ResourceNotFoundException
     * 
     * @param ex Eccezione da gestire
     * @return Response entity con corpo JSON
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        log.warn("Risorsa non trovata: {}", ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    /**
     * Gestisce le eccezioni di tipo IllegalArgumentException
     * 
     * @param ex Eccezione da gestire
     * @return Response entity con corpo JSON
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Argomento non valido: {}", ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
    }

    /**
     * Gestisce le eccezioni di tipo AccessDeniedException
     * 
     * @param ex Eccezione da gestire
     * @return Response entity con corpo JSON
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Accesso negato: {}", ex.getMessage());
        return buildResponse(HttpStatus.FORBIDDEN, "Accesso negato/non autorizzato", null);
    }

    /**
     * Gestisce le eccezioni di tipo BadCredentialsException
     * 
     * @param ex Eccezione da gestire
     * @return Response entity con corpo JSON
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
        log.warn("Tentativo di login fallito: {}", ex.getMessage());
        return buildResponse(HttpStatus.UNAUTHORIZED, "Email o password errati", null);
    }

    /**
     * Gestisce le eccezioni di tipo MethodArgumentNotValidException
     * 
     * @param ex Eccezione da gestire
     * @return Response entity con corpo JSON
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        log.warn("Validazione fallita: {}", ex.getMessage());
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return buildResponse(HttpStatus.BAD_REQUEST, "Errore di validazione", errors);
    }

    /**
     * Gestisce le eccezioni generiche
     * 
     * @param ex Eccezione da gestire
     * @return Response entity con corpo JSON
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception ex) {
        log.error("Errore imprevisto", ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Errore interno del server: " + ex.getMessage(), null);
    }

    /**
     * Metodo di supporto per la creazione di una response entity con corpo JSON
     * 
     * @param status  Status HTTP da ritornare
     * @param message Messaggio di errore da ritornare
     * @param errors  Oggetto contenente eventuali errori di validazione
     * @return Response entity con corpo JSON
     */
    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message,
            Map<String, String> errors) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        if (errors != null) {
            body.put("errors", errors);
        }
        return new ResponseEntity<>(body, status);
    }
}
