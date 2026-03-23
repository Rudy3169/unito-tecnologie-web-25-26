package com.phytosend.repository;

import com.phytosend.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    ;
    // Trova i post più recenti ordinati per data con paginazione
    org.springframework.data.domain.Page<Post> findAllByOrderByCreationDateDesc(
            org.springframework.data.domain.Pageable pageable);
}