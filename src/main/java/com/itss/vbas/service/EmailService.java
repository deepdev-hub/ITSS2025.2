package com.itss.vbas.service;

public interface EmailService {
    boolean sendResetPasswordOtp(String toEmail, String otp, long expiresInMinutes);
}
