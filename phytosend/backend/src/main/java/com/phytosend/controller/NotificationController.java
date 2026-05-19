package com.phytosend.controller;

import com.phytosend.dto.NotificationDto;
import com.phytosend.service.NotificationService;
import com.phytosend.service.PlantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller per la gestione delle Notifiche e delle Azioni rapide sugli eventi
 * di cura.
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PlantService plantService;

    /**
     * Restituisce il numero di notifiche non lette (per il badge della campanella).
     *
     * @param userId ID dell'utente
     * @return conteggio notifiche non lette
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestParam @NonNull Long userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Restituisce le ultime 5 notifiche di un utente (per il dropdown).
     *
     * @param userId ID dell'utente
     * @return lista di NotificationDto
     */
    @GetMapping("/recent")
    public ResponseEntity<List<NotificationDto>> getRecentNotifications(@RequestParam @NonNull Long userId) {
        List<NotificationDto> notifications = notificationService.getRecentNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Restituisce tutte le notifiche di un utente, paginate (per la
     * sidebar/storico).
     *
     * @param userId ID dell'utente
     * @param page   pagina (default 0)
     * @param size   dimensione pagina (default 20)
     * @return pagina di NotificationDto
     */
    @GetMapping
    public Page<NotificationDto> getAllNotifications(
            @RequestParam @NonNull Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return notificationService.getAllNotifications(userId, page, size);
    }

    /**
     * Segna una notifica come letta.
     *
     * @param notificationId ID della notifica
     * @return stato ok
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable @NonNull Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    /**
     * Segna tutte le notifiche di un utente come lette.
     *
     * @param userId ID dell'utente
     * @return stato ok
     */
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@RequestParam @NonNull Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Completa un evento di cura direttamente dal centro notifiche.
     *
     * @param eventId ID dell'evento di cura
     * @return stato ok con messaggio di conferma
     */
    @PostMapping("/care-events/{eventId}/complete")
    public ResponseEntity<Map<String, String>> completeCareEvent(@PathVariable @NonNull Long eventId) {
        plantService.completeCareEvent(eventId);
        return ResponseEntity.ok(Map.of("message", "Evento completato con successo"));
    }
}
