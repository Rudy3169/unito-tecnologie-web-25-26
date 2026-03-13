package com.phytosend.controller;

import com.phytosend.dto.CommentDto;
import com.phytosend.dto.PostDto;
import com.phytosend.entity.Comment;
import com.phytosend.entity.Post;
import com.phytosend.service.DtoConverter;
import com.phytosend.service.SocialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/social")
// @CrossOrigin rimosso: gestito globalmente in SecurityConfig
public class SocialController {

    @Autowired
    private SocialService socialService;

    @Autowired
    private DtoConverter dtoConverter;

    // 1. GET /api/social/posts -> Ottieni la bacheca
    @GetMapping("/posts")
    public List<PostDto> getBacheca() {
        return socialService.getFeed().stream()
                .map(dtoConverter::toPostDto)
                .collect(Collectors.toList());
    }

    // 2. POST /api/social/posts?utenteId=1 -> Crea un post
    // Nota: stiamo passando l'ID utente come query param per semplicità
    @PostMapping("/posts")
    public PostDto creaPost(@RequestParam Long utenteId, @Valid @RequestBody Post post) {
        Post created = socialService.createPost(utenteId, post);
        return dtoConverter.toPostDto(created);
    }

    // 3. POST /api/social/posts/1/commenti?utenteId=2 -> Aggiungi commento al post 1
    // Usa @PathVariable per l'ID del post e @RequestBody per il testo
    @PostMapping("/posts/{postId}/commenti")
    public CommentDto commentaPost(@PathVariable Long postId,
                                @RequestParam Long utenteId,
                                @RequestBody Map<String, String> body) {
        // Ci aspettiamo un JSON tipo: { "testo": "Bel ficus!" }
        String testo = body.get("testo");
        Comment comment = socialService.addComment(postId, utenteId, testo);
        return dtoConverter.toCommentDto(comment);
    }
}