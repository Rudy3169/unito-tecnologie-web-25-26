package com.phytosend.service;

import com.phytosend.entity.Commento;
import com.phytosend.entity.Post;
import com.phytosend.entity.Utente;
import com.phytosend.repository.CommentoRepository;
import com.phytosend.repository.PostRepository;
import com.phytosend.repository.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SocialService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentoRepository commentoRepository;

    @Autowired
    private UtenteRepository utenteRepository; // Serve per recuperare l'autore

    // CREA UN NUOVO POST
    public Post creaPost(Long utenteId, Post post) {
        Utente autore = utenteRepository.findById(utenteId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        post.setAutore(autore);
        post.setDataCreazione(LocalDateTime.now());
        return postRepository.save(post);
    }

    // LEGGI TUTTI I POST (BACHECA)
    public List<Post> getBacheca() {
        return postRepository.findAllByOrderByDataCreazioneDesc();
    }

    // AGGIUNGI UN COMMENTO A UN POST
    public Commento aggiungiCommento(Long postId, Long utenteId, String testoCommento) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post non trovato"));

        Utente autore = utenteRepository.findById(utenteId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        Commento nuovoCommento = new Commento();
        nuovoCommento.setPost(post);
        nuovoCommento.setAutore(autore);
        nuovoCommento.setTesto(testoCommento);
        nuovoCommento.setDataCreazione(LocalDateTime.now());

        return commentoRepository.save(nuovoCommento);
    }
}