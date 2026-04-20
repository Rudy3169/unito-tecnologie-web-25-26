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

@RestController
@RequestMapping("/api/social")
public class SocialController {

    @Autowired
    private SocialService socialService;

    @Autowired
    private DtoConverter dtoConverter;

    /**
     * Fornisce l'intera bacheca social pubblica, contenente i post ordinati
     * cronologicamente dalla data più recente, divisa in pagine.
     *
     * @param page parametro opzionale della pagina (default 0)
     * @param size parametro opzionale limitatore (default 10)
     * @return pagina dei post pubblicati (PostDto)
     */
    @GetMapping("/posts")
    public Page<PostDto> getBacheca(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long utenteId // ← nuovo parametro
    ) {
        Page<Post> posts = socialService.getFeed(page, size);
        return posts.map(post -> {
            PostDto dto = dtoConverter.toPostDto(post);
            if (utenteId != null && post.getLikedBy() != null) {
                boolean liked = post.getLikedBy().stream()
                        .anyMatch(u -> u.getId().equals(utenteId));
                dto.setLikedByMe(liked);
            }
            return dto;
        });
    }

    /**
     * Crea un nuovo post all'interno della piattaforma social e lo attribuisce
     * all'autore.
     *
     * @param utenteId ID dell'autore (sostituito in query string per uso in dev
     *                 localmente)
     * @param post     entità post contente il testo ed eventuale foto
     * @return il post creato in DTO
     */
    @PostMapping("/posts")
    public PostDto creaPost(@RequestParam @NonNull Long utenteId, @Valid @RequestBody Post post) {
        Post created = socialService.createPost(utenteId, post);
        return dtoConverter.toPostDto(created);
    }

    /**
     * Aggiunge un commento al thread di uno specifico post esistente.
     */
    @PostMapping("/posts/{postId}/commenti")
    public CommentDto commentaPost(@PathVariable @NonNull Long postId,
            @RequestParam @NonNull Long utenteId,
            @RequestBody Map<String, Object> body) { // Cambiato in Object per accettare numeri

        String testo = (String) body.get("testo");

        // Estraiamo il parentId in modo sicuro se è stato inviato dal frontend
        Long parentId = null;
        if (body.get("parentId") != null) {
            parentId = Long.valueOf(body.get("parentId").toString());
        }

        // Passiamo anche parentId al servizio
        Comment comment = socialService.addComment(postId, utenteId, testo, parentId);
        return dtoConverter.toCommentDto(comment);
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
     * @param postId ID del post di cui si vogliono ottenere i commenti
     * @return lista di commenti in formato DTO
     */
    @GetMapping("/posts/{postId}/commenti")
    public List<CommentDto> getCommenti(@PathVariable @NonNull Long postId) {
        return socialService.getCommentiDelPost(postId);
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

}