package com.itss.vbas.service;

public interface EmailService {
    boolean sendResetPasswordEmail(String toEmail, String link);
}
