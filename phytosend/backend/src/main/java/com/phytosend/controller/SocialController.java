package com.phytosend.controller;

import com.phytosend.dto.CommentDto;
import com.phytosend.dto.PostDto;
import com.phytosend.entity.Comment;
import com.phytosend.entity.Post;
import com.phytosend.service.DtoConverter;
import com.phytosend.service.SocialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;

import jakarta.validation.Valid;

import java.util.Map;
import java.util.List;

/**
 * Controller per la gestione dei post e dei commenti
 */
@RestController
@RequestMapping("/api/social")
public class SocialController {

    // Servizio per la gestione dei post e dei commenti
    @Autowired
    private SocialService socialService;

    // Convertitore di DTO
    @Autowired
    private DtoConverter dtoConverter;

    /**
     * Fornisce l'intera bacheca social pubblica, contenente i post ordinati
     * cronologicamente dalla data più recente, divisa in pagine.
     *
     * @param page     parametro opzionale della pagina (default 0)
     * @param size     parametro opzionale limitatore (default 10)
     * @param utenteId ID dell'utente corrente (per calcolare likedByMe)
     * @return pagina dei post pubblicati (PostDto)
     */
    @GetMapping("/posts")
    public Page<PostDto> getBacheca(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long utenteId) {
        Page<Post> posts = socialService.getFeed(page, size);
        return posts.map(post -> {
            PostDto dto = dtoConverter.toPostDto(post);
            if (utenteId != null && post.getLikedBy() != null) {
                boolean liked = post.getLikedBy().stream()
                        .anyMatch(u -> u.getId().equals(utenteId));
                dto.setLikedByMe(liked);
            }
            if (utenteId != null && post.getSavedBy() != null) {
                boolean saved = post.getSavedBy().stream()
                        .anyMatch(u -> u.getId().equals(utenteId));
                dto.setSavedByMe(saved);
            }
            return dto;
        });
    }

    /**
     * Recupera tutti i post pubblicati da un utente specifico.
     *
     * @param userId   ID dell'utente di cui si vogliono i post
     * @param utenteId ID dell'utente corrente (per calcolare likedByMe)
     * @return lista di PostDto ordinati per data discendente
     */
    @GetMapping("/posts/user/{userId}")
    public List<com.phytosend.dto.PostDto> getPostsByUser(
            @PathVariable Long userId,
            @RequestParam(required = false) Long utenteId) {
        return socialService.getPostsByUser(userId, utenteId);
    }

    /**
     * Recupera tutti i post associati a una specifica pianta.
     *
     * @param plantId  ID della pianta
     * @param utenteId ID dell'utente corrente (per calcolare likedByMe)
     * @return lista di PostDto ordinati per data discendente
     */
    @GetMapping("/posts/plant/{plantId}")
    public List<PostDto> getPostsByPlant(
            @PathVariable Long plantId,
            @RequestParam(required = false) Long utenteId) {
        return socialService.getPostsByPlant(plantId, utenteId);
    }

    /**
     * Crea un nuovo post all'interno della piattaforma social e lo attribuisce
     * all'autore.
     *
     * @param utenteId ID dell'autore
     * @param post     entità post contente il testo ed eventuale foto
     * @return il post creato in DTO
     */
    @PostMapping("/posts")
    public PostDto creaPost(@RequestParam @NonNull Long utenteId,
            @Valid @RequestBody com.phytosend.dto.PostCreateDto postDto) {
        Post created = socialService.createPost(utenteId, postDto);
        return dtoConverter.toPostDto(created);
    }

    /**
     * Aggiunge un commento al thread di uno specifico post esistente.
     *
     * @param postId   ID del post a cui aggiungere il commento
     * @param utenteId ID dell'utente che aggiunge il commento
     * @param body     corpo della richiesta contenente il testo del commento
     * @return il commento aggiunto in formato DTO
     */
    @PostMapping("/posts/{postId}/commenti")
    public CommentDto commentaPost(@PathVariable @NonNull Long postId,
            @RequestParam @NonNull Long utenteId,
            @RequestBody Map<String, Object> body) {

        // Estraiamo il testo del commento
        String testo = (String) body.get("testo");

        // Estraiamo il parentId se è stato inviato dal frontend
        Long parentId = null;
        if (body.get("parentId") != null) {
            parentId = Long.valueOf(body.get("parentId").toString());
        }

        // Aggiungiamo il commento al post tramite il servizio
        Comment comment = socialService.addComment(postId, utenteId, testo, parentId);

        // Restituiamo il commento convertito in DTO
        return dtoConverter.toCommentDto(comment, null);
    }

    /**
     * Rimuove interamente un post specifico, assicurando prima che l'invocante
     * sia l'effettivo autore o un admin autorizzato.
     *
     * @param postId   l'ID del post da eliminare
     * @param utenteId l'ID utente loggato richiamante
     * @return stato vuoto al completamento
     */
    @DeleteMapping("/posts/{postId}")
    public org.springframework.http.ResponseEntity<Void> deletePost(@PathVariable @NonNull Long postId,
            @RequestParam @NonNull Long utenteId) {
        socialService.deletePost(postId, utenteId);
        return org.springframework.http.ResponseEntity.noContent().build();
    }

    /**
     * Recupera tutti i commenti associati a un determinato post.
     *
     * @param postId   ID del post di cui si vogliono ottenere i commenti
     * @param utenteId ID dell'utente corrente (per calcolare likes)
     * @return lista di commenti in formato DTO
     */
    @GetMapping("/posts/{postId}/commenti")
    public List<CommentDto> getCommenti(
            @PathVariable @NonNull Long postId,
            @RequestParam(required = false) Long utenteId) {
        return socialService.getCommentiDelPost(postId, utenteId);
    }

    /**
     * Aggiunge o rimuove un like a un post.
     * 
     * @param postId   ID del post
     * @param utenteId ID dell'utente
     * @return true se il like è stato aggiunto, false se è stato rimosso
     */
    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @PathVariable Long postId,
            @RequestParam Long utenteId) {
        boolean isNowLiked = socialService.toggleLike(postId, utenteId);
        return ResponseEntity.ok(Map.of("isLikedByMe", isNowLiked));
    }

    /**
     * Aggiunge o rimuove un like a un commento.
     * 
     * @param commentId ID del commento
     * @param utenteId  ID dell'utente
     * @return true se il like è stato aggiunto, false se è stato rimosso
     */
    @PostMapping("/commenti/{commentId}/like")
    public ResponseEntity<Boolean> toggleCommentLike(
            @PathVariable Long commentId,
            @RequestParam Long utenteId) {
        return ResponseEntity.ok(socialService.toggleCommentLike(commentId, utenteId));
    }

    /**
     * Elimina un commento o una risposta, rispettando le regole di moderazione
     * 
     * @param postId    ID del post
     * @param commentId ID del commento
     * @param utenteId  ID dell'utente
     * @return stato vuoto al completamento
     */
    @DeleteMapping("/posts/{postId}/commenti/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable("postId") Long postId,
            @PathVariable("commentId") Long commentId,
            @RequestParam("utenteId") Long utenteId) {

        socialService.deleteComment(postId, commentId, utenteId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Aggiunge o rimuove un post dai preferiti (salvati).
     * 
     * @param postId   ID del post
     * @param utenteId ID dell'utente
     * @return true se salvato, false se rimosso
     */
    @PostMapping("/posts/{postId}/save")
    public ResponseEntity<Map<String, Object>> toggleSavePost(
            @PathVariable Long postId,
            @RequestParam Long utenteId) {
        boolean isNowSaved = socialService.toggleSavePost(postId, utenteId);
        return ResponseEntity.ok(Map.of("isSavedByMe", isNowSaved));
    }

    /**
     * Recupera tutti i post salvati da un utente.
     * 
     * @param utenteId ID dell'utente
     * @return lista di PostDto
     */
    @GetMapping("/posts/saved")
    public List<PostDto> getSavedPosts(
            @RequestParam Long utenteId) {
        return socialService.getSavedPosts(utenteId);
    }
}