package com.phytosend.service;

import com.phytosend.dto.CommentDto;
import com.phytosend.entity.Comment;
import com.phytosend.entity.Post;
import com.phytosend.entity.User;
import com.phytosend.repository.CommentRepository;
import com.phytosend.repository.PostRepository;
import com.phytosend.repository.UserRepository;
import com.phytosend.service.DtoConverter;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SocialService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DtoConverter dtoConverter;

    /**
     * Raccoglie i metadati per creare e salvare un nuovo Post di un Utente sulla
     * piattaforma.
     *
     * @param userId l'ID utente
     * @param post   l'istanza del nuovo post da salvare in bacheca
     * @return entità Post finale salvata
     */
    public Post createPost(@NonNull Long userId, Post post) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        post.setAuthor(author);
        post.setCreationDate(LocalDateTime.now());
        return postRepository.save(post);
    }

    /**
     * Interroga JPA per ottenere in ordine cronologico inverso la galleria generale
     * dei post (Bacheca).
     *
     * @param page indice della pagina
     * @param size dimensione risultati
     * @return pagina dei post presenti nel datastore
     */
    public org.springframework.data.domain.Page<Post> getFeed(int page, int size) {
        return postRepository
                .findAllByOrderByCreationDateDesc(org.springframework.data.domain.PageRequest.of(page, size));
    }

    /**
     * Gestisce l'aggiunta di un blocco di testo commento sotto un certo post
     * autorizzato da un utente valido.
     *
     * @param postId      Id del social post
     * @param userId      Id dell'utente che commenta
     * @param textComment corpo stringa
     * @return il Comment serializzabile salvato su db
     */
    public Comment addComment(@NonNull Long postId, @NonNull Long userId, String textComment, Long parentId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post non trovato"));

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        Comment newComment = new Comment();
        newComment.setPost(post);
        newComment.setAuthor(author);
        newComment.setText(textComment);
        newComment.setCreationDate(LocalDateTime.now());

        if (parentId != null) {
            Comment parentComment = commentRepository.findById(parentId).orElse(null);
            newComment.setParent(parentComment);
        }

        return commentRepository.save(newComment);
    }

    /**
     * Recupera i commenti di un post in formato DTO.
     * 
     * @param postId ID del post
     * @return Lista di CommentDto
     */
    public List<CommentDto> getCommentiDelPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post non trovato: " + postId));
        return post.getComments().stream()
                .map(dtoConverter::toCommentDto)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Preforma l'eliminazione profonda di un post, assicurandosi nel while logico
     * che
     * solo l'utente che lo ha creato possa invocarne la distruzione per sicurezza
     * orizzontale.
     *
     * @param postId id del post richiesto
     * @param userId user session che fa la call all'API
     */
    public void deletePost(@NonNull Long postId, @NonNull Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post non trovato"));

        // Verifica autorizzazione (solo l'autore può eliminare)
        if (!post.getAuthor().getId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Non sei autorizzato a eliminare questo post");
        }

        postRepository.delete(post);
    }

    /**
     * Gestisce l'aggiunta di un like a un post.
     * 
     * @param postId   ID del post
     * @param utenteId ID dell'utente
     * @return true se il like è stato aggiunto, false se è stato rimosso
     */
    public boolean toggleLike(Long postId, Long utenteId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post non trovato"));
        User user = userRepository.findById(utenteId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        if (post.getLikedBy().contains(user)) {
            post.getLikedBy().remove(user);
            postRepository.save(post);
            return false;
        } else {
            post.getLikedBy().add(user);
            postRepository.save(post);
            return true;
        }
    }

}