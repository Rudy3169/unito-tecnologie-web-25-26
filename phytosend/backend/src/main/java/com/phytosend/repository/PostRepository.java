package com.phytosend.repository;

import com.phytosend.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Interfaccia repository per Post
 */
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    /**
     * Trova i post più recenti ordinati per data con paginazione
     * 
     * @param pageable Oggetto di paginazione
     * @return Pagina di post ordinati per data decrescente
     */
    org.springframework.data.domain.Page<Post> findAllByOrderByCreationDateDesc(
            org.springframework.data.domain.Pageable pageable);

    /**
     * Trova tutti i post di un utente specifico
     * 
     * @param authorId ID dell'autore
     * @return Lista di post dell'autore
     */
    List<Post> findByAuthorIdOrderByCreationDateDesc(Long authorId);

    /**
     * Trova tutti i post associati a una pianta specifica
     * 
     * @param plantId ID della pianta
     * @return Lista di post della pianta ordinati per data decrescente
     */
    List<Post> findByPlantIdOrderByCreationDateDesc(Long plantId);

    /**
     * Trova tutti i post salvati da un utente specifico
     * 
     * @param userId ID dell'utente
     * @return Lista di post salvati dall'utente ordinati per data decrescente
     */
    List<Post> findBySavedByIdOrderByCreationDateDesc(Long userId);
}