package com.itss.vbas.dto.company;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.itss.vbas.dto.common.CommonDto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class CompanyDto {

    private CompanyDto() {
    }

    public record CompanyRequest(
            @NotBlank @Size(max = 255) String companyName,
            @Size(max = 50) String taxCode,
            @Size(max = 100) String licenseNumber,
            @Email String email,
            @Size(max = 20) String phone,
            @Size(max = 2000) String description,
            @NotBlank String status,
            Long ownerAccountId
    ) {
    }

    public record CompanyResponse(
            Long id,
            String companyName,
            String taxCode,
            String licenseNumber,
            String email,
            String phone,
            String description,
            String status,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            CommonDto.AccountSummaryResponse ownerAccount
    ) {
    }

    public record StaffRequest(
            Long userId,
            @Email String email,
            @Size(min = 6, max = 100) String password,
            @Size(max = 255) String fullName,
            @Size(max = 20) String phone,
            @Size(max = 255) String jobTitle,
            @Min(0) Integer yearsExperience,
            @Size(max = 2000) String bio,
            @NotBlank String status
    ) {
    }

    public record StaffResponse(
            Long id,
            Long userId,
            Long companyId,
            String fullName,
            String email,
            String phone,
            String jobTitle,
            String avatarUrl,
            Integer yearsExperience,
            String bio,
            String status,
            BigDecimal currentLatitude,
            BigDecimal currentLongitude
    ) {
    }

    public record LocationUpdateRequest(
            @NotNull BigDecimal latitude,
            @NotNull BigDecimal longitude
    ) {
    }

    public record StaffProfileResponse(
            Long id,
            Long userId,
            String avatarUrl,
            String fullName,
            String email,
            String phone,
            Long companyId,
            String companyName,
            String jobTitle,
            String status,
            Integer yearsExperience,
            BigDecimal averageRating,
            long completedRequests,
            String bio
    ) {
    }

    public record VehicleRequest(
            @NotBlank @Size(max = 100) String vehicleCode,
            @NotBlank @Size(max = 100) String vehicleType,
            @NotBlank @Size(max = 50) String plateNumber,
            @NotBlank String status
    ) {
    }

    public record VehicleResponse(
            Long id,
            Long companyId,
            String vehicleCode,
            String vehicleType,
            String plateNumber,
            String status
    ) {
    }

    public record QuoteRequest(
            Long staffId,
            BigDecimal estimatedAmount,
            BigDecimal finalAmount,
            @Size(max = 255) String serviceName,
            @Min(1) Integer quantity,
            BigDecimal unitPrice,
            BigDecimal subtotal,
            LocalDateTime expiresAt
    ) {
    }
}
