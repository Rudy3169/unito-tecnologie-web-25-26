package com.phytosend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

/**
 * Classe che rappresenta un Post
 */
@Data
@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // ID post

    @NotBlank(message = "Il titolo è obbligatorio")
    private String title; // Titolo post

    @NotBlank(message = "La descrizione è obbligatoria")
    private String description; // Descrizione post

    @Column(columnDefinition = "TEXT")
    private String URLPhoto; // URL foto post

    private LocalDateTime creationDate; // Data e ora di creazione

    // RELAZIONI
    // Ogni post ha un autore (utente)
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User author;

    // Ogni post fa riferimento a una pianta
    @ManyToOne
    @JoinColumn(name = "plant_id")
    private Plant plant;

    // Ogni post può avere più commenti
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Comment> comments;

    // Ogni post può avere più like
    @ManyToMany
    @JoinTable(name = "post_likes", joinColumns = @JoinColumn(name = "post_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    @JsonIgnore
    private Set<User> likedBy = new HashSet<>();

    // Ogni post può essere salvato da più utenti
    @ManyToMany
    @JoinTable(name = "post_saved", joinColumns = @JoinColumn(name = "post_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    @JsonIgnore
    private Set<User> savedBy = new HashSet<>();
}