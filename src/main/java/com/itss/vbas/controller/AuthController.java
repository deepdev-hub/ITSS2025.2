package com.itss.vbas.controller;

import java.util.List;

import com.itss.vbas.dto.auth.AuthDto;
import com.itss.vbas.dto.common.CommonDto;
import com.itss.vbas.security.RequireAuth;
import com.itss.vbas.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<CommonDto.ApiResponse<AuthDto.AuthResponse>> register(@Valid @RequestBody AuthDto.RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonDto.ApiResponse.success("Customer registered successfully", authService.registerCustomer(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<CommonDto.ApiResponse<AuthDto.AuthResponse>> login(@Valid @RequestBody AuthDto.LoginRequest request) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Login successful", authService.login(request)));
    }

    @RequireAuth
    @GetMapping("/me")
    public ResponseEntity<CommonDto.ApiResponse<AuthDto.ProfileResponse>> me() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Current profile fetched successfully", authService.getCurrentProfile()));
    }

    @RequireAuth
    @PutMapping("/profile")
    public ResponseEntity<CommonDto.ApiResponse<AuthDto.ProfileResponse>> updateProfile(@Valid @RequestBody AuthDto.UpdateProfileRequest request) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Profile updated successfully", authService.updateProfile(request)));
    }

    @RequireAuth
    @PutMapping("/change-password")
    public ResponseEntity<CommonDto.ApiResponse<Void>> changePassword(@Valid @RequestBody AuthDto.ChangePasswordRequest request) {
        authService.changePassword(request);
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Password changed successfully"));
    }

    @GetMapping("/lookups/incident-types")
    public ResponseEntity<CommonDto.ApiResponse<List<CommonDto.LookupResponse>>> getIncidentLookups() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Incident types fetched successfully", authService.getIncidentLookups()));
    }

    @GetMapping("/lookups/service-types")
    public ResponseEntity<CommonDto.ApiResponse<List<CommonDto.LookupResponse>>> getServiceLookups() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Service types fetched successfully", authService.getServiceLookups()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<CommonDto.ApiResponse<AuthDto.PasswordResetResponse>> forgotPassword(@RequestParam String email) {
        AuthDto.PasswordResetResponse response = authService.forgotPassword(email);
        String message = response.emailSent()
                ? "Reset password link sent successfully"
                : "Reset password link generated. Email is not configured, use the returned link.";
        return ResponseEntity.ok(CommonDto.ApiResponse.success(message, response));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<CommonDto.ApiResponse<Void>> resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword
    ) {
        authService.resetPassword(token, newPassword);
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Password reset successfully"));
    }

    @RequireAuth
    @PostMapping("/upload-avatar")
    public ResponseEntity<CommonDto.ApiResponse<CommonDto.FileUploadResponse>> uploadAvatar(
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success(
                "Avatar uploaded successfully",
                authService.uploadAvatar(file)
        ));
    }
}
