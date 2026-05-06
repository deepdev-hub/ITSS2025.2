package com.itss.vbas.service;

public interface EmailService {
    void sendResetPasswordEmail(String toEmail, String link);
}
