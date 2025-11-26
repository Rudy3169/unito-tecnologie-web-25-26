package com.phytosend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
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
}