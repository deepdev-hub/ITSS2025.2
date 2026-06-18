package com.itss.vbas.service.impl;

import com.itss.vbas.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public EmailServiceImpl(JavaMailSender mailSender, @Value("${app.mail.from:${MAIL_FROM:}}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    @Override
    public boolean sendResetPasswordOtp(String toEmail, String otp, long expiresInMinutes) {
        if (!isMailSenderConfigured()) {
            log.warn("Mail sender is not configured. Password reset OTP for {}: {}", toEmail, otp);
            return false;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        String from = resolveFromAddress();
        if (hasText(from)) {
            message.setFrom(from);
        }
        message.setTo(toEmail);
        message.setSubject("Your VBAS password reset OTP");
        message.setText("""
                We received a request to reset your VBAS password.

                Your OTP code is:
                %s

                This code expires in %d minutes.
                If you did not request this, you can ignore this email.
                """.formatted(otp, expiresInMinutes));

        try {
            mailSender.send(message);
            return true;
        } catch (MailException exception) {
            log.error("Failed to send password reset OTP email to {}", toEmail, exception);
            return false;
        }
    }

    private boolean isMailSenderConfigured() {
        if (mailSender instanceof JavaMailSenderImpl sender) {
            return hasText(sender.getHost()) && hasText(sender.getUsername()) && hasText(sender.getPassword());
        }
        return true;
    }

    private String resolveFromAddress() {
        if (mailSender instanceof JavaMailSenderImpl sender) {
            String configuredFrom = sender.getJavaMailProperties().getProperty("vbas.mail.from");
            if (hasText(configuredFrom)) {
                return configuredFrom.trim();
            }
        }
        if (hasText(fromAddress)) {
            return fromAddress.trim();
        }
        if (mailSender instanceof JavaMailSenderImpl sender && hasText(sender.getUsername())) {
            return sender.getUsername().trim();
        }
        return null;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
