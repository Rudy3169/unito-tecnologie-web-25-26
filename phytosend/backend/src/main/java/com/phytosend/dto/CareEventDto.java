package com.phytosend.dto;

import lombok.Data;
import java.time.LocalDate;

/**
 * DTO per la risposta dell'Evento di Cura
 */
@Data
public class CareEventDto {
    private Long id; //ID dell'evento di cura
    private LocalDate programmedDate; //Data programmata
    private String type; //Tipo di evento: "ACQUA", "CONCIME", "TRAVASO"
    private boolean completed; //Se l'evento è stato completato
    private LocalDate completedDate; //Data di completamento
    private String notes; //Note aggiuntive
}
