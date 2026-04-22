package com.phytosend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CommentDto {
    private Long id;
    private String text;
    private String creationDate;
    private UserDto author;
    private Long parentId;
    private Long authorId;
    private int likesCount;
    private boolean likedByMe;

    /**
     * Getter per l'ID dell'autore
     * 
     * @return ID dell'autore
     */
    public Long getAuthorId() {
        return authorId;
    }

    /**
     * Setter per l'ID dell'autore
     * 
     * @param authorId ID dell'autore
     */
    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }

    /**
     * Getter per la data di creazione
     * 
     * @return data di creazione
     */
    public String getCreationDate() {
        return creationDate;
    }

    /**
     * Setter per la data di creazione
     * 
     * @param creationDate data di creazione
     */
    public void setCreationDate(String creationDate) {
        this.creationDate = creationDate;
    }

    /**
     * Getter per l'ID del commento padre
     * 
     * @return ID del commento padre
     */
    public Long getParentId() {
        return parentId;
    }

    /**
     * Setter per l'ID del commento padre
     * 
     * @param parentId ID del commento padre
     */
    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }
}
