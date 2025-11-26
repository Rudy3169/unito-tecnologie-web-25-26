package com.phytosend.controller;

import com.phytosend.entity.Comment;
import com.phytosend.entity.Post;
import com.phytosend.service.SocialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/social")
@CrossOrigin(origins = "http://localhost:5173")
public class SocialController {

    @Autowired
    private SocialService socialService;

    // 1. GET /api/social/posts -> Ottieni la bacheca
    @GetMapping("/posts")
    public List<Post> getBacheca() {
        return socialService.getFeed();
    }

    // 2. POST /api/social/posts?utenteId=1 -> Crea un post
    // Nota: stiamo passando l'ID utente come query param per semplicità
    @PostMapping("/posts")
    public Post creaPost(@RequestParam Long utenteId, @RequestBody Post post) {
        return socialService.createPost(utenteId, post);
    }

    // 3. POST /api/social/posts/1/commenti?utenteId=2 -> Aggiungi commento al post 1
    // Usa @PathVariable per l'ID del post e @RequestBody per il testo
    @PostMapping("/posts/{postId}/commenti")
    public Comment commentaPost(@PathVariable Long postId,
                                @RequestParam Long utenteId,
                                @RequestBody Map<String, String> body) {
        // Ci aspettiamo un JSON tipo: { "testo": "Bel ficus!" }
        String testo = body.get("testo");
        return socialService.addComment(postId, utenteId, testo);
    }
}