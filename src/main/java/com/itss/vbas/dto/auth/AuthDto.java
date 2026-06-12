package com.itss.vbas.dto.auth;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.itss.vbas.dto.common.CommonDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDto {

    private AuthDto() {
    }

    public record RegisterRequest(
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, max = 100) String password,
            @NotBlank @Size(max = 255) String fullName,
            @Size(max = 20) String phone,
            LocalDate dateOfBirth,
            @Size(max = 20) String gender,
            @Size(max = 20) String cccd,
            @Valid CommonDto.AddressRequest defaultAddress
    ) {
    }

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {
    }

    public record UpdateProfileRequest(
            @NotBlank @Size(max = 255) String fullName,
            @Size(max = 20) String phone,
            @Size(max = 1000) String avatarUrl,
            LocalDate dateOfBirth,
            @Size(max = 20) String gender,
            @Size(max = 20) String cccd,
            @Valid CommonDto.AddressRequest defaultAddress
    ) {
    }

    public record ChangePasswordRequest(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 6, max = 100) String newPassword
    ) {
    }

    public record ProfileResponse(
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
            CommonDto.AddressResponse defaultAddress,
            Long companyId,
            Long staffId
    ) {
    }

    public record AuthResponse(
            String token,
            ProfileResponse user
    ) {
    }

    public record PasswordResetResponse(
            String resetLink,
            boolean emailSent
    ) {
    }
}
