package com.phytosend.service;

import com.phytosend.dto.CommentDto;
import com.phytosend.dto.PostDto;
import com.phytosend.entity.Comment;
import com.phytosend.entity.Post;
import com.phytosend.entity.User;
import com.phytosend.repository.CommentRepository;
import com.phytosend.repository.PostRepository;
import com.phytosend.repository.UserRepository;
import com.phytosend.repository.PlantRepository;
import com.phytosend.repository.BotanicalCardRepository;

import com.phytosend.entity.Plant;
import com.phytosend.entity.BotanicalCard;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Gestore del social layer del sistema.
 * Include metodi per la gestione di post, commenti e interazioni.
 */
@Service
public class SocialService {

    // Repository per i post
    @Autowired
    private PostRepository postRepository;

    // Repository per i commenti
    @Autowired
    private CommentRepository commentRepository;

    // Repository per gli utenti
    @Autowired
    private UserRepository userRepository;

    // Repository per le piante
    @Autowired
    private PlantRepository plantRepository;

    // Repository per le schede botaniche
    @Autowired
    private BotanicalCardRepository botanicalCardRepository;

    // Servizio per le piante
    @Autowired
    private PlantService plantService;

    // Convertitore di DTO
    @Autowired
    private DtoConverter dtoConverter;

    /**
     * Crea e salva un nuovo post di un utente sulla piattaforma.
     *
     * @param userId l'ID utente
     * @param post   l'istanza del nuovo post da salvare in bacheca
     * @return entità Post finale salvata
     */
    public Post createPost(@NonNull Long userId, com.phytosend.dto.PostCreateDto postDto) {
        // Trova l'autore del post
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        // Crea il post
        Post post = new Post();
        post.setTitle(postDto.getTitle()); // Imposta il titolo
        post.setDescription(postDto.getDescription()); // Imposta la descrizione
        post.setURLPhoto(postDto.getUrlPhoto()); // Imposta l'URL della foto
        post.setAuthor(author); // Imposta l'autore
        post.setCreationDate(LocalDateTime.now()); // Imposta la data di creazione

        // Gestione della pianta associata
        if (postDto.getBotanicalCardId() != null) {
            // Se si vuole aggiungere una pianta al giardino
            if (postDto.isAddToGarden()) {
                // Trova la scheda botanica
                BotanicalCard card = botanicalCardRepository.findById(postDto.getBotanicalCardId())
                        .orElseThrow(() -> new RuntimeException("Scheda botanica non trovata"));
                // Crea una nuova pianta associata al giardino e all'utente
                Plant newPlant = plantService.addPlantToGarden(author, card);

                // Se l'utente ha inserito un soprannome, lo aggiunge alla pianta
                if (postDto.getPlantName() != null && !postDto.getPlantName().trim().isEmpty()) {
                    newPlant.setName(postDto.getPlantName());
                    plantRepository.save(newPlant);
                }

                post.setPlant(newPlant); // Associa la nuova pianta al post
            }
        } else {
            // Se si vuole associare una pianta esistente al post
            Plant existingPlant = plantRepository.findById(postDto.getPlantId())
                    .orElseThrow(() -> new RuntimeException("Pianta non trovata"));

            // Verifica che l'utente sia il proprietario della pianta
            if (existingPlant.getGarden() == null || !existingPlant.getGarden().getOwner().getId().equals(userId)) {
                throw new org.springframework.security.access.AccessDeniedException("Questa pianta non ti appartiene");
            }
            // Associa la pianta esistente al post
            post.setPlant(existingPlant);
        }

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
     * @param currentUserId ID dell'utente che sta facendo la richiesta (per
     *                      calcolare likedByMe)
     * @return lista di PostDto ordinati per data discendente
     */
    public List<PostDto> getPostsByUser(Long userId, Long currentUserId) {
        List<Post> posts = postRepository.findByAuthorIdOrderByCreationDateDesc(userId);
        return posts.stream().map(post -> {
            PostDto dto = dtoConverter.toPostDto(post);
            // Calcola likedByMe in base ai like del post
            if (currentUserId != null && post.getLikedBy() != null) {
                boolean liked = post.getLikedBy().stream()
                        .anyMatch(u -> u.getId().equals(currentUserId));
                dto.setLikedByMe(liked);
            }
            if (currentUserId != null && post.getSavedBy() != null) {
                boolean saved = post.getSavedBy().stream()
                        .anyMatch(u -> u.getId().equals(currentUserId));
                dto.setSavedByMe(saved);
            }
            return dto;
        }).collect(java.util.stream.Collectors.toList());
    }

    /**
     * Recupera tutti i post associati a una pianta specifica.
     *
     * @param plantId       ID della pianta
     * @param currentUserId ID dell'utente che sta facendo la richiesta (per
     *                      calcolare likedByMe)
     * @return lista di PostDto ordinati per data discendente
     */
    public List<PostDto> getPostsByPlant(Long plantId, Long currentUserId) {
        List<Post> posts = postRepository.findByPlantIdOrderByCreationDateDesc(plantId);
        return posts.stream().map(post -> {
            PostDto dto = dtoConverter.toPostDto(post);
            if (currentUserId != null && post.getLikedBy() != null) {
                boolean liked = post.getLikedBy().stream()
                        .anyMatch(u -> u.getId().equals(currentUserId));
                dto.setLikedByMe(liked);
            }
            if (currentUserId != null && post.getSavedBy() != null) {
                boolean saved = post.getSavedBy().stream()
                        .anyMatch(u -> u.getId().equals(currentUserId));
                dto.setSavedByMe(saved);
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
        // Trova il post
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post non trovato"));

        // Trova l'autore del commento
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        // Crea il commento
        Comment newComment = new Comment();
        newComment.setPost(post);
        newComment.setAuthor(author);
        newComment.setText(textComment);
        newComment.setCreationDate(LocalDateTime.now());

        // Gestione commento padre (per risposte)
        if (parentId != null) {
            Comment parentComment = commentRepository.findById(parentId).orElse(null);
            newComment.setParent(parentComment);
        }

        // Salva il commento
        return commentRepository.save(newComment);
    }

    /**
     * Recupera i commenti di un post in formato DTO.
     * 
     * @param postId ID del post
     * @return Lista di CommentDto
     */
    public List<CommentDto> getCommentiDelPost(Long postId, Long currentUserId) {
        // Trova il post
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post non trovato: " + postId));

        // Restituisce i commenti del post convertiti in DTO
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
        // Trova il post
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
        // Trova il post
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post non trovato"));
        // Trova l'utente
        User user = userRepository.findById(utenteId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        // Gestione like
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
        // Trova il commento
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Commento non trovato"));
        // Trova l'utente
        User user = userRepository.findById(utenteId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        // Gestione like
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
        // Trova il commento
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Commento non trovato"));

        // Prevenzione NullPointer per le risposte
        Post post = comment.getPost();
        if (post == null && comment.getParent() != null) {
            post = comment.getParent().getPost();
        }

        // Prevenzione NullPointer per il post
        if (post == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Errore: Post non trovato per questo commento");
        }

        // Ottiene l'ID dell'autore del post e del commento
        Long postAuthorId = post.getAuthor().getId();
        Long commentAuthorId = comment.getAuthor().getId();

        // Verifica se l'utente è l'autore del post o del commento
        boolean isPostAuthor = userId.equals(postAuthorId);
        boolean isCommentAuthor = userId.equals(commentAuthorId);

        // Controllo permessi base (chi non c'entra niente viene bloccato subito)
        if (!isPostAuthor && !isCommentAuthor) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Non sei autorizzato a eliminare questo commento");
        }

        // Recupera le risposte
        List<Comment> risposte = commentRepository.findByParentId(commentId);

        // Controllo permessi (L'autore di un commento è bloccato se ci sono risposte)
        if (isCommentAuthor && !isPostAuthor && !risposte.isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Non puoi eliminare un commento con risposte.");
        }

        // Eliminazione fisica del commento
        try {
            // Elimina tutte le risposte del commento principale
            if (!risposte.isEmpty()) {
                commentRepository.deleteAll(risposte);
                // Elimina le risposte dal database
                commentRepository.flush();
            }

            // Elimina il commento principale
            commentRepository.delete(comment);
            // Elimina il commento principale dal database
            commentRepository.flush();

        } catch (Exception e) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "Errore database: " + e.getMessage());
        }
    }

    /**
     * Aggiunge o rimuove un post dai preferiti (salvati) di un utente.
     * 
     * @param postId   ID del post
     * @param utenteId ID dell'utente
     * @return true se il post è stato salvato, false se è stato rimosso
     */
    public boolean toggleSavePost(Long postId, Long utenteId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post non trovato"));
        User user = userRepository.findById(utenteId)
                .orElseThrow(() -> new EntityNotFoundException("Utente non trovato"));

        boolean isSaved = post.getSavedBy().contains(user);
        if (isSaved) {
            post.getSavedBy().remove(user);
        } else {
            post.getSavedBy().add(user);
        }

        postRepository.save(post);
        return !isSaved;
    }

    /**
     * Recupera tutti i post salvati da un utente specifico.
     * 
     * @param utenteId ID dell'utente
     * @return lista di PostDto ordinati
     */
    public List<PostDto> getSavedPosts(Long utenteId) {
        List<Post> savedPosts = postRepository.findBySavedByIdOrderByCreationDateDesc(utenteId);

        return savedPosts.stream().map(post -> {
            PostDto dto = dtoConverter.toPostDto(post);
            if (post.getLikedBy() != null) {
                boolean liked = post.getLikedBy().stream()
                        .anyMatch(u -> u.getId().equals(utenteId));
                dto.setLikedByMe(liked);
            }
            dto.setSavedByMe(true);
            return dto;
        }).collect(java.util.stream.Collectors.toList());
    }
}