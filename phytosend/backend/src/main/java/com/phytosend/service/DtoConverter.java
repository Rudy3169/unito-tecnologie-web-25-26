package com.phytosend.service;

import com.phytosend.dto.GardenDto;
import com.phytosend.dto.PlantDto;
import com.phytosend.dto.UserDto;
import com.phytosend.dto.BotanicalCardDto;
import com.phytosend.entity.Garden;
import com.phytosend.entity.BotanicalCard;
import com.phytosend.entity.Plant;
import com.phytosend.entity.User;
import com.phytosend.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

/**
 * Gestore per la conversione di entità in DTO
 */
@Service
public class DtoConverter {

    @Autowired
    private PostRepository postRepository;

    /**
     * Converte un'entità User del database in un Data Transfer Object.
     * Utile per omettere campi sensibili come la password in fase di risposta API.
     *
     * @param user l'entità origine
     * @return l'oggetto UserDto popolato
     */
    public UserDto toUserDto(User user) {
        if (user == null)
            return null;
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setSurname(user.getSurname());
        dto.setEmail(user.getEmail());
        dto.setCity(user.getCity());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setBio(user.getBio());
        dto.setBirthDate(user.getBirthDate());
        dto.setRole(user.getRole());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());
        // postsCount e plantsCount vengono impostati dal controller quando serve
        return dto;
    }

    /**
     * Converte un'entità BotanicalCard del database in un Data Transfer Object.
     * Utile per omettere campi sensibili come la password in fase di risposta API.
     * 
     * @param card l'entità origine
     * @return l'oggetto BotanicalCardDto popolato
     */
    public BotanicalCardDto toBotanicalCardDto(BotanicalCard card) {
        if (card == null) {
            return null;
        }
        BotanicalCardDto dto = new BotanicalCardDto();
        dto.setId(card.getId());
        dto.setCommonName(card.getCommonName());
        dto.setScientificName(card.getScientificName());
        dto.setFamily(card.getFamily());
        dto.setExposure(card.getExposure());
        dto.setIrrigation(card.getIrrigation());
        dto.setWaterFrequencyDays(card.getWaterFrequencyDays());
        dto.setFertilization(card.getFertilization());
        dto.setSoil(card.getSoil());
        dto.setUrlDefaultPhoto(card.getUrlDefaultPhoto());
        dto.setCreatedAt(card.getCreatedAt());
        return dto;
    }

    /**
     * Mappa l'entità Plant (giardino) nel suo rispettivo PlantDto, astraendo le
     * relazioni complesse (Garden)
     * per evitare riferimenti circolari nella serializzazione JSON.
     *
     * @param plant l'entità origine
     * @return oggetto PlantDto
     */
    public PlantDto toPlantDto(Plant plant) {
        if (plant == null)
            return null;
        PlantDto dto = new PlantDto();
        dto.setId(plant.getId());
        dto.setName(plant.getName());
        dto.setUrlPhoto(plant.getUrlPhoto());
        dto.setPurchaseDate(plant.getPurchaseDate());
        dto.setDeathDate(plant.getDeathDate());
        dto.setCard(toBotanicalCardDto(plant.getCard()));
        return dto;
    }

    /**
     * Converte i dati di un Garden, popolando il nome padrone e impacchettando
     * ricorsivamente
     * la sua lista di piante in una collection di DTO.
     *
     * @param garden entità master Garden
     * @return il formato alleggerito GardenDto
     */
    public GardenDto toGardenDto(Garden garden) {
        if (garden == null)
            return null;
        GardenDto dto = new GardenDto();
        dto.setId(garden.getId());
        dto.setName(garden.getName());
        if (garden.getOwner() != null) {
            dto.setOwnerId(garden.getOwner().getId());
            dto.setOwnerName(garden.getOwner().getName() + " " + garden.getOwner().getSurname());
        }
        if (garden.getPlants() != null) {
            dto.setPlants(garden.getPlants().stream()
                    .map(this::toPlantDto)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    /**
     * Converte un intero Post social nei suoi dati serializzabili, inclusi l'autore
     * e la pianta correlata.
     *
     * @param post entità social post
     * @return il corrispondente PostDto
     */
    public com.phytosend.dto.PostDto toPostDto(com.phytosend.entity.Post post) {
        if (post == null)
            return null;
        com.phytosend.dto.PostDto dto = new com.phytosend.dto.PostDto();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setDescription(post.getDescription());
        dto.setURLPhoto(post.getURLPhoto());
        dto.setCreationDate(post.getCreationDate());
        dto.setAuthor(toUserDto(post.getAuthor()));
        dto.setPlant(toPlantDto(post.getPlant()));
        dto.setLikesCount(post.getLikedBy() != null ? post.getLikedBy().size() : 0);
        dto.setLikedByMe(false);
        // Calcola quanti commenti ci sono. Se la lista è nulla, restituisce 0.
        int conteggio = (post.getComments() != null) ? post.getComments().size() : 0;
        // Imposta il conteggio dei commenti.
        dto.setCommentsCount(conteggio);
        dto.setPlant(toPlantDto(post.getPlant()));
        return dto;
    }

    /**
     * Isola il commento dalle referenze pesanti per prepararlo alla trasmissione
     * client-side.
     *
     * @param comment il commento originario persistito
     * @return CommentDto standardizzato
     */
    public com.phytosend.dto.CommentDto toCommentDto(com.phytosend.entity.Comment comment, Long currentUserId) {
        if (comment == null)
            return null;
        com.phytosend.dto.CommentDto dto = new com.phytosend.dto.CommentDto();
        dto.setId(comment.getId());
        dto.setText(comment.getText());
        if (comment.getCreationDate() != null) {
            dto.setCreationDate(comment.getCreationDate().toString());
        }
        dto.setAuthor(toUserDto(comment.getAuthor()));
        Long parentId = (comment.getParent() != null) ? comment.getParent().getId() : null;
        dto.setParentId(parentId);
        dto.setAuthorId(comment.getAuthor().getId());
        dto.setLikesCount(comment.getLikedBy() != null ? comment.getLikedBy().size() : 0);
        dto.setLikedByMe(currentUserId != null && comment.getLikedBy() != null &&
                comment.getLikedBy().stream().anyMatch(u -> u.getId().equals(currentUserId)));
        return dto;
    }

    /**
     * Converte un'entità Notification nel suo DTO per il frontend.
     *
     * @param notification l'entità notifica origine
     * @return l'oggetto NotificationDto popolato
     */
    public com.phytosend.dto.NotificationDto toNotificationDto(com.phytosend.entity.Notification notification) {
        if (notification == null)
            return null;
        com.phytosend.dto.NotificationDto dto = new com.phytosend.dto.NotificationDto();
        dto.setId(notification.getId());
        dto.setType(notification.getType());
        dto.setReferenceId(notification.getReferenceId());
        dto.setSecondaryReferenceId(notification.getSecondaryReferenceId());
        dto.setMessage(notification.getMessage());
        dto.setRead(notification.isRead());
        if (notification.getCreatedAt() != null) {
            // Aggiungiamo 'Z' per forzare il parsing in UTC sul frontend e correggere il fuso orario (+2h)
            dto.setCreatedAt(notification.getCreatedAt().toString() + "Z");
        }
        // Se è una notifica social, recuperiamo l'ID dell'autore del post
        if (notification.getType() != com.phytosend.entity.NotificationType.CARE_WATER && notification.getReferenceId() != null) {
            postRepository.findById(notification.getReferenceId()).ifPresent(post -> {
                dto.setPostAuthorId(post.getAuthor().getId());
            });
        }
        // Info sull'attore
        if (notification.getActor() != null) {
            dto.setActorId(notification.getActor().getId());
            dto.setActorName(notification.getActor().getName() + " " + notification.getActor().getSurname());
            dto.setActorProfilePhotoUrl(notification.getActor().getProfilePhotoUrl());
        }
        return dto;
    }
}
