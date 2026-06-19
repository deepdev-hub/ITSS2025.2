package com.itss.vbas.dto.admin;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.itss.vbas.dto.common.CommonDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class AdminDto {

    private AdminDto() {
    }

    public record AccountRequest(
            @NotBlank @Email String email,
            @Size(min = 6, max = 100) String password,
            @NotBlank @Size(max = 255) String fullName,
            @Size(max = 20) String phone,
            @Size(max = 1000) String avatarUrl,
            @NotBlank String roleName,
            @NotBlank String status,
            LocalDate dateOfBirth,
            @Size(max = 20) String gender,
            @NotBlank @Size(max = 20) String cccd,
            @Valid CommonDto.AddressRequest defaultAddress
    ) {
    }

    public record AccountResponse(
            Long id,
            String email,
            String fullName,
            String phone,
            String avatarUrl,
            String status,
            String roleName,
            LocalDateTime createdAt,
            LocalDate dateOfBirth,
            String gender,
            String cccd,
            CommonDto.AddressResponse defaultAddress
    ) {
    }

    public record RoleRequest(
            @NotBlank String roleName
    ) {
    }

    public record IncidentTypeRequest(
            @NotBlank @Size(max = 50) String incidentCode,
            @NotBlank @Size(max = 255) String incidentName,
            @Size(max = 1000) String description
    ) {
    }

    public record IncidentTypeResponse(
            Long id,
            String incidentCode,
            String incidentName,
            String description
    ) {
    }

    public record ServiceTypeRequest(
            @NotBlank @Size(max = 50) String serviceCode,
            @NotBlank @Size(max = 255) String serviceName,
            @Size(max = 1000) String description
    ) {
    }

    public record ServiceTypeResponse(
            Long id,
            String serviceCode,
            String serviceName,
            String description
    ) {
    }

    public record AssignStaffRequest(
            @NotNull Long staffId,
            @Size(max = 500) String note
    ) {
    }
}
