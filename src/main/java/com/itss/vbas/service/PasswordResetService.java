package com.itss.vbas.service;

import com.itss.vbas.dto.auth.AuthDto;

public interface PasswordResetService {
    AuthDto.PasswordResetResponse forgotPassword(AuthDto.PasswordResetRequest request);

    AuthDto.PasswordResetVerificationResponse verifyResetOtp(AuthDto.VerifyPasswordResetOtpRequest request);

    void resetPassword(AuthDto.ResetPasswordRequest request);
}
