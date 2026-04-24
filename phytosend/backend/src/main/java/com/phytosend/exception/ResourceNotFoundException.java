package com.phytosend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Eccezione lanciata quando una risorsa non viene trovata
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Costruttore dell'eccezione
     * 
     * @param message Messaggio di errore
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }
}