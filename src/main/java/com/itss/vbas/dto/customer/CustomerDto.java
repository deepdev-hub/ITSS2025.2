package com.itss.vbas.dto.customer;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class CustomerDto {

    private CustomerDto() {
    }

    public record VehicleRequest(
            @NotBlank @Size(max = 100) String brand,
            @NotBlank @Size(max = 100) String model,
            @NotBlank @Size(max = 50) String plateNumber,
            @Min(1900) @Max(2100) Integer manufactureYear,
            @Size(max = 50) String color,
            @Size(max = 50) String fuelType,
            @Size(max = 1000) String notes
    ) {
    }

    public record VehicleResponse(
            Long id,
            String brand,
            String model,
            String plateNumber,
            Integer manufactureYear,
            String color,
            String fuelType,
            String notes
    ) {
    }
}
