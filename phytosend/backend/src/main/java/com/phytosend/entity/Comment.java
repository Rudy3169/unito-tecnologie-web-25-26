package com.phytosend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Classe che rappresenta un Commento
 */
@Data
@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // ID commento

    private String text; // Testo del commento
    private LocalDateTime creationDate; // Data e ora di creazione del commento

    // RELAZIONI
    // Ogni autore (utente) può avere molti commenti
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User author;

    // Ogni post può avere molti commenti
    @ManyToOne
    @JoinColumn(name = "post_id")
    @JsonIgnore
    private Post post;

    // Ogni commento può avere più risposte
    @ManyToOne
    @JoinColumn(name = "parent_id")
    @JsonIgnore
    private Comment parent;

    // Più utenti possono mettere like a più commenti
    @ManyToMany
    @JoinTable(name = "comment_likes", joinColumns = @JoinColumn(name = "comment_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<User> likedBy = new HashSet<>();
}