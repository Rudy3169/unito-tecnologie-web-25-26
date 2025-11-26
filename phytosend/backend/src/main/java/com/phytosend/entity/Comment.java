package com.phytosend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String text;
    private LocalDateTime creationDate;

    // RELAZIONI
    // Ogni commento ha un autore (utente)
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User author;

    // Ogni commento appartiene a un post
    @ManyToOne
    @JoinColumn(name = "post_id")
    @JsonIgnore // Evita il loop infinito JSON
    private Post post;
}