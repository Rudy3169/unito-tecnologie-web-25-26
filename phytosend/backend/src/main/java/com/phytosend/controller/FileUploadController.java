package com.phytosend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

/**
 * Controller per l'upload e la cancellazione di foto profilo.
 * I file vengono salvati nella cartella "uploads/profile-photos/" e serviti
 * come risorse statiche.
 */
@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    /**
     * Carica una foto profilo sul server.
     *
     * @param file il file multipart inviato dal client
     * @return l'URL relativo del file salvato
     */
    @PostMapping("/profile-photo")
    public ResponseEntity<Map<String, String>> uploadProfilePhoto(@RequestParam("file") MultipartFile file) {
        try {
            // Validazione tipo file
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Il file deve essere un'immagine"));
            }

            // Validazione dimensione (massimo 5 MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Il file non può superare i 5 MB"));
            }

            // Crea la directory se non esiste
            Path profilePhotosDir = Paths.get(uploadDir, "profile-photos");
            Files.createDirectories(profilePhotosDir);

            // Genera un nome file univoco
            String extension = getExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + extension;

            // Salva il file
            Path filePath = profilePhotosDir.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Restituisce il percorso relativo accessibile dal frontend
            String url = "/uploads/profile-photos/" + filename;

            return ResponseEntity.ok(Map.of("url", url));

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Errore durante il salvataggio del file"));
        }
    }

    /**
     * Elimina una foto profilo dal server.
     *
     * @param payload contiene il campo "url" con il percorso relativo della foto
     * @return 200 OK se eliminata con successo
     */
    @DeleteMapping("/profile-photo")
    public ResponseEntity<Void> deleteProfilePhoto(@RequestBody Map<String, String> payload) {

        // Recupera l'url della foto profilo
        String url = payload.get("url");

        // Controlla se l'url è valido
        if (url == null || !url.startsWith("/uploads/profile-photos/")) {
            return ResponseEntity.badRequest().build();
        }

        try {
            // Estrae il nome file dal percorso
            String filename = url.replace("/uploads/profile-photos/", "");

            // Crea il percorso completo del file
            Path filePath = Paths.get(uploadDir, "profile-photos", filename);

            // Elimina il file se esiste
            Files.deleteIfExists(filePath);
            return ResponseEntity.ok().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Estrae l'estensione dal nome file originale.
     */
    private String getExtension(String filename) {
        if (filename == null)
            return ".jpg";

        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : ".jpg";
    }
}
