package com.phytosend.service;

import com.phytosend.entity.Comment;
import com.phytosend.entity.Post;
import com.phytosend.entity.User;
import com.phytosend.repository.CommentRepository;
import com.phytosend.repository.PostRepository;
import com.phytosend.repository.UserRepository;
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
    private UserRepository userRepository; // Serve per recuperare l'autore

    // CREA UN NUOVO POST
    public Post createPost(@NonNull Long userId, Post post) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        post.setAuthor(author);
        post.setCreationDate(LocalDateTime.now());
        return postRepository.save(post);
    }

    // LEGGI TUTTI I POST (BACHECA)
    public List<Post> getFeed() {
        return postRepository.findAllByOrderByCreationDateDesc();
    }

    // AGGIUNGI UN COMMENTO A UN POST
    public Comment addComment(@NonNull Long postId, @NonNull Long userId, String textComment) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post non trovato"));

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        Comment newComment = new Comment();
        newComment.setPost(post);
        newComment.setAuthor(author);
        newComment.setText(textComment);
        newComment.setCreationDate(LocalDateTime.now());

        return commentRepository.save(newComment);
    }
}