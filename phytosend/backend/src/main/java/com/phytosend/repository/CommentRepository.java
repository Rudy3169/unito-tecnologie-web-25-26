package com.phytosend.repository;

import com.phytosend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Interfaccia Repository per i Commenti
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    /**
     * Trova tutti i commenti legati a un genitore specifico
     * 
     * @param parentId ID del genitore
     * @return Lista di commenti legati al genitore
     */
    List<Comment> findByParentId(Long parentId);
}