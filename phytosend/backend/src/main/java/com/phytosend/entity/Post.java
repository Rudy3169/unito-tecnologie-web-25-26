package com.phytosend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

@Data
@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Il titolo è obbligatorio")
    private String title;

    @NotBlank(message = "La descrizione è obbligatoria")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String URLPhoto;

    private LocalDateTime creationDate;

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
}