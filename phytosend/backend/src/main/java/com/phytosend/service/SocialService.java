package com.phytosend.service;

import com.phytosend.dto.CommentDto;
import com.phytosend.dto.PostDto;
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
     * Recupera tutti i post pubblicati da un utente specifico.
     *
     * @param userId        ID dell'utente di cui si vogliono i post
     * @param currentUserId ID dell'utente che sta facendo la richiesta (per calcolare likedByMe)
     * @return lista di PostDto ordinati per data discendente
     */
    public List<PostDto> getPostsByUser(Long userId, Long currentUserId) {
        List<Post> posts = postRepository.findByAuthorIdOrderByCreationDateDesc(userId);
        return posts.stream().map(post -> {
            PostDto dto = dtoConverter.toPostDto(post);
            if (currentUserId != null && post.getLikedBy() != null) {
                boolean liked = post.getLikedBy().stream()
                        .anyMatch(u -> u.getId().equals(currentUserId));
                dto.setLikedByMe(liked);
            }
            return dto;
        }).collect(java.util.stream.Collectors.toList());
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
    public List<CommentDto> getCommentiDelPost(Long postId, Long currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post non trovato: " + postId));
        return post.getComments().stream()
                .map(c -> dtoConverter.toCommentDto(c, currentUserId))
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

    /**
     * Gestisce l'aggiunta di un like a un commento.
     * 
     * @param commentId ID del commento
     * @param utenteId  ID dell'utente
     * @return true se il like è stato aggiunto, false se è stato rimosso
     */
    public boolean toggleCommentLike(Long commentId, Long utenteId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Commento non trovato"));
        User user = userRepository.findById(utenteId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        if (comment.getLikedBy().contains(user)) {
            comment.getLikedBy().remove(user);
            commentRepository.save(comment);
            return false; // Like rimosso
        } else {
            comment.getLikedBy().add(user);
            commentRepository.save(comment);
            return true; // Like aggiunto
        }
    }

    /**
     * Elimina un commento o una risposta, rispettando le regole di moderazione
     * 
     * @param postId    ID del post
     * @param commentId ID del commento
     * @param userId    ID dell'utente
     */
    @org.springframework.transaction.annotation.Transactional
    public void deleteComment(Long postId, Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Commento non trovato"));

        // 1. Prevenzione NullPointer per le risposte
        Post post = comment.getPost();
        if (post == null && comment.getParent() != null) {
            post = comment.getParent().getPost();
        }

        if (post == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Errore: Post non trovato per questo commento");
        }

        Long postAuthorId = post.getAuthor().getId();
        Long commentAuthorId = comment.getAuthor().getId();

        boolean isPostAuthor = userId.equals(postAuthorId);
        boolean isCommentAuthor = userId.equals(commentAuthorId);

        // 2. Controllo permessi base (chi non c'entra niente viene bloccato subito)
        if (!isPostAuthor && !isCommentAuthor) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Non sei autorizzato a eliminare questo commento");
        }

        // 3. RECUPERIAMO LE RISPOSTE
        // Usiamo il repository per trovare tutte le risposte che hanno questo commento
        // come parent
        List<Comment> risposte = commentRepository.findByParentId(commentId);

        // 4. Regola d'oro permessi (Autore commento bloccato se ci sono risposte)
        if (isCommentAuthor && !isPostAuthor && !risposte.isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Non puoi eliminare un commento con risposte.");
        }

        // 5. ELIMINAZIONE FISICA
        try {
            if (!risposte.isEmpty()) {
                // Eliminiamo prima tutte le risposte
                commentRepository.deleteAll(risposte);
                // Forziamo il database a eseguire l'eliminazione SUBITO
                commentRepository.flush();
            }

            // Ora che il padre è "orfano", possiamo eliminarlo senza errori di vincolo
            commentRepository.delete(comment);
            commentRepository.flush();

        } catch (Exception e) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "Errore database: " + e.getMessage());
        }
    }
}