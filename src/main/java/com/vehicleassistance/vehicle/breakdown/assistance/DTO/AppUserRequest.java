package com.vehicleassistance.vehicle.breakdown.assistance.DTO;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppUserRequest {

    private String fullName;
    private String email;
    private String phone;
}

