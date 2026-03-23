package com.phytosend.controller;

import com.phytosend.dto.CommentDto;
import com.phytosend.dto.PostDto;
import com.phytosend.entity.Comment;
import com.phytosend.entity.Post;
import com.phytosend.service.DtoConverter;
import com.phytosend.service.SocialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import jakarta.validation.Valid;

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
    public org.springframework.data.domain.Page<PostDto> getBacheca(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return socialService.getFeed(page, size).map(dtoConverter::toPostDto);
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
     *
     * @param postId   ID del post padre
     * @param utenteId ID dell'autore del commento
     * @param body     map JSON attesa contenente la chiave 'testo' del commento
     *                 (es. { "testo": "Bel ficus!" })
     * @return la risposta commento creata
     */
    @PostMapping("/posts/{postId}/commenti")
    public CommentDto commentaPost(@PathVariable @NonNull Long postId,
            @RequestParam @NonNull Long utenteId,
            @RequestBody Map<String, String> body) {
        String testo = body.get("testo");
        Comment comment = socialService.addComment(postId, utenteId, testo);
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
}