package com.itss.vbas.service;

import java.util.List;

import com.itss.vbas.dto.auth.AuthDto;
import com.itss.vbas.dto.common.CommonDto;
import org.springframework.web.multipart.MultipartFile;

public interface AuthService {
    AuthDto.AuthResponse registerCustomer(AuthDto.RegisterRequest request);

    AuthDto.AuthResponse login(AuthDto.LoginRequest request);

    AuthDto.ProfileResponse getCurrentProfile();

    AuthDto.ProfileResponse updateProfile(AuthDto.UpdateProfileRequest request);

    void changePassword(AuthDto.ChangePasswordRequest request);

    List<CommonDto.LookupResponse> getIncidentLookups();

    List<CommonDto.LookupResponse> getServiceLookups();

    AuthDto.PasswordResetResponse forgotPassword(AuthDto.PasswordResetRequest request);

    AuthDto.PasswordResetVerificationResponse verifyResetOtp(AuthDto.VerifyPasswordResetOtpRequest request);

    void resetPassword(AuthDto.ResetPasswordRequest request);

    CommonDto.FileUploadResponse uploadAvatar(MultipartFile file);
}
