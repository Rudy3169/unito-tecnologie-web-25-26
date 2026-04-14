package com.phytosend.service;

import com.phytosend.dto.GardenDto;
import com.phytosend.dto.PlantDto;
import com.phytosend.dto.UserDto;
import com.phytosend.entity.Garden;
import com.phytosend.entity.Plant;
import com.phytosend.entity.User;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class DtoConverter {

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
        dto.setRole(user.getRole());
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
        dto.setUrlPhoto(plant.getUrlPhoto());
        dto.setPurchaseDate(plant.getPurchaseDate());
        if (plant.getCard() != null) {
            dto.setBotanicalCardId(plant.getCard().getId());
            dto.setBotanicalCardName(plant.getCard().getScientificName()); // Assuming scientificName exists
        }
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
        return dto;
    }

    /**
     * Isola il commento dalle referenze pesanti per prepararlo alla trasmissione
     * client-side.
     *
     * @param comment il commento originario persistito
     * @return CommentDto standardizzato
     */
    public com.phytosend.dto.CommentDto toCommentDto(com.phytosend.entity.Comment comment) {
        if (comment == null)
            return null;
        com.phytosend.dto.CommentDto dto = new com.phytosend.dto.CommentDto();
        dto.setId(comment.getId());
        dto.setText(comment.getText());
        dto.setCreationDate(comment.getCreationDate());
        dto.setAuthor(toUserDto(comment.getAuthor()));
        return dto;
    }
}
