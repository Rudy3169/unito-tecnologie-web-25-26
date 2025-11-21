package com.phytosend.backend.repository;

import com.phytosend.backend.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // Metodo personalizzato per trovare i post con un certo tag (es. "SOS")
    List<Post> findByTag(String tag);

    // Trova i post più recenti ordinati per data (utile per la bacheca)
    List<Post> findAllByOrderByDataCreazioneDesc();
}