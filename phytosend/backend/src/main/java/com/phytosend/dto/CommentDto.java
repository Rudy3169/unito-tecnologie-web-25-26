package com.phytosend.dto;

import lombok.Data;

/**
 * DTO per la risposta del commento
 */
@Data
public class CommentDto {
    private Long id; // ID del commento
    private String text; // Testo del commento
    private String creationDate; // Data di creazione del commento
    private UserDto author; // Autore del commento
    private Long parentId; // ID del commento padre
    private int likesCount; // Numero di like
    private boolean likedByMe; // Se l'utente ha messo like

    /**
     * Getter per l'ID dell'autore
     * 
     * @return ID dell'autore
     */
    public Long getAuthorId() {
        return author.getId();
    }

    /**
     * Setter per l'ID dell'autore
     * 
     * @param authorId ID dell'autore
     */
    public void setAuthorId(Long authorId) {
        this.author.setId(authorId);
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
