package com.itss.vbas.dto.common;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class CommonDto {

    private CommonDto() {
    }

    public record ApiResponse<T>(
            boolean success,
            String message,
            T data,
            LocalDateTime timestamp
    ) {
        public static <T> ApiResponse<T> success(String message, T data) {
            return new ApiResponse<>(true, message, data, LocalDateTime.now());
        }

        public static ApiResponse<Void> success(String message) {
            return success(message, null);
        }

        public static ApiResponse<Void> failure(String message) {
            return new ApiResponse<>(false, message, null, LocalDateTime.now());
        }
    }

    public record AddressRequest(
            @Size(max = 100) String country,
            @Size(max = 100) String province,
            @Size(max = 100) String district,
            @Size(max = 100) String ward,
            @Size(max = 255) String street,
            @Size(max = 500) String detail,
            @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") BigDecimal latitude,
            @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") BigDecimal longitude
    ) {
    }

    public record AddressResponse(
            Long id,
            String country,
            String province,
            String district,
            String ward,
            String street,
            String detail,
            BigDecimal latitude,
            BigDecimal longitude,
            String fullAddress
    ) {
    }

    public record LookupResponse(
            Long id,
            String code,
            String name
    ) {
    }

    public record RoleResponse(
            Long id,
            String roleName
    ) {
    }

    public record AccountSummaryResponse(
            Long id,
            String email,
            String fullName,
            String phone,
            String avatarUrl,
            String status,
            String roleName,
            LocalDate dateOfBirth,
            String gender,
            String cccd
    ) {
    }

    public record BasicCompanyResponse(
            Long id,
            String companyName,
            String status,
            String phone,
            String email
    ) {
    }

    public record StatusUpdateRequest(
            @NotBlank String status,
            @Size(max = 500) String note
    ) {
    }

    public record SimpleNoteRequest(
            @Size(max = 500) String note
    ) {
    }

    public record IdentityRequest(
            @NotBlank
            @Pattern(regexp = "^[A-Z0-9_]+$", message = "Code must contain only uppercase letters, numbers, and underscore")
            String code
    ) {
    }
}
