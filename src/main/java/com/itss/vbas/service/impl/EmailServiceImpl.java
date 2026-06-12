package com.itss.vbas.service.impl;

import com.itss.vbas.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public boolean sendResetPasswordEmail(String toEmail, String link) {
        if (!isMailSenderConfigured()) {
            log.warn("Mail sender is not configured. Password reset link for {}: {}", toEmail, link);
            return false;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Reset your VBAS password");
        message.setText("Open this link to reset your password:\n" + link);

        try {
            mailSender.send(message);
            return true;
        } catch (MailException exception) {
            log.error("Failed to send password reset email to {}. Reset link: {}", toEmail, link, exception);
            return false;
        }
    }

    private boolean isMailSenderConfigured() {
        if (mailSender instanceof JavaMailSenderImpl sender) {
            return hasText(sender.getHost()) && hasText(sender.getUsername()) && hasText(sender.getPassword());
        }
        return true;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
