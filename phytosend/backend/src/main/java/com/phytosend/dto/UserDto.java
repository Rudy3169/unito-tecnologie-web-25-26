package com.phytosend.dto;

import com.phytosend.entity.UserRole;
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String name;
    private String surname;
    private String email;
    private String phoneNumber;
    private String city;
    private UserRole role;
    
    // Non includiamo la password!
}
