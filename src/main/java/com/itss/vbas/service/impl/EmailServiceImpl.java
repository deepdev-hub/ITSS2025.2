package com.itss.vbas.service.impl;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itss.vbas.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String resendApiKey;
    private final String resendApiUrl;
    private final String fromEmail;
    private final Duration readTimeout;

    public EmailServiceImpl(
            ObjectMapper objectMapper,
            @Value("${resend.api.key:}") String resendApiKey,
            @Value("${resend.api.url:https://api.resend.com/emails}") String resendApiUrl,
            @Value("${resend.api.connect-timeout:10s}") Duration connectTimeout,
            @Value("${resend.api.read-timeout:15s}") Duration readTimeout,
            @Value("${app.mail.from:}") String fromEmail
    ) {
        this.objectMapper = objectMapper;
        this.resendApiKey = resendApiKey;
        this.resendApiUrl = resendApiUrl;
        this.fromEmail = fromEmail;
        this.readTimeout = readTimeout;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(connectTimeout)
                .build();
    }

    @Override
    public boolean sendResetPasswordEmail(String toEmail, String link) {
        if (!isResendConfigured()) {
            log.warn("Resend mail is not configured. Password reset email was not sent to {}", toEmail);
            return false;
        }

        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(resendApiUrl.trim()))
                    .timeout(readTimeout)
                    .header("Authorization", "Bearer " + resendApiKey.trim())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(buildResetPasswordPayload(toEmail, link)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            boolean accepted = response.statusCode() >= 200 && response.statusCode() < 300;
            if (!accepted) {
                log.error("Resend failed to send password reset email to {}. Status: {}, body: {}",
                        toEmail, response.statusCode(), response.body());
            }
            return accepted;
        } catch (IllegalArgumentException | IOException exception) {
            log.error("Failed to send password reset email to {} via Resend", toEmail, exception);
            return false;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            log.error("Interrupted while sending password reset email to {} via Resend", toEmail, exception);
            return false;
        }
    }

    private String buildResetPasswordPayload(String toEmail, String link) throws JsonProcessingException {
        String text = "Open this link to reset your VBAS password:\n" + link;
        String html = """
                <p>You requested to reset your VBAS password.</p>
                <p><a href="%s">Reset password</a></p>
                <p>If you did not request this email, you can ignore it.</p>
                """.formatted(link);
        return objectMapper.writeValueAsString(Map.of(
                "from", fromEmail.trim(),
                "to", List.of(toEmail),
                "subject", "Reset your VBAS password",
                "html", html,
                "text", text
        ));
    }

    private boolean isResendConfigured() {
        return hasText(resendApiKey) && hasText(resendApiUrl) && hasText(fromEmail);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
