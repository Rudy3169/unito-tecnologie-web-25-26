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
    private String bio;
    private String birthDate;
    private UserRole role;
    private int postsCount;
    private int plantsCount;

    // Non includiamo la password!
}
