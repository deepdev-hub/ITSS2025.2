package com.itss.vbas.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.mail.MailProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

@Configuration
public class MailConfig {

    // MailProperties may not be available during early bootstrap in some contexts,
    // so inject it optionally and fall back to Environment if null.
    @Autowired(required = false)
    private MailProperties mailProperties;

    @Bean
    @ConditionalOnMissingBean
    public JavaMailSender javaMailSender(Environment env) {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        Map<String, String> dotenv = loadDotEnv();

        String host = firstText(mailProperties == null ? null : mailProperties.getHost(), env.getProperty("spring.mail.host"), env.getProperty("MAIL_HOST"), dotenv.get("MAIL_HOST"), "smtp.gmail.com");
        Integer port = mailProperties != null && mailProperties.getPort() != null
                ? mailProperties.getPort()
                : Integer.parseInt(firstText(env.getProperty("spring.mail.port"), env.getProperty("MAIL_PORT"), dotenv.get("MAIL_PORT"), "587"));
        String username = firstText(mailProperties == null ? null : mailProperties.getUsername(), env.getProperty("spring.mail.username"), env.getProperty("MAIL_USERNAME"), dotenv.get("MAIL_USERNAME"));
        String password = firstText(mailProperties == null ? null : mailProperties.getPassword(), env.getProperty("spring.mail.password"), env.getProperty("MAIL_PASSWORD"), dotenv.get("MAIL_PASSWORD"));
        String protocol = firstText(mailProperties == null ? null : mailProperties.getProtocol(), env.getProperty("spring.mail.protocol"), env.getProperty("MAIL_PROTOCOL"), dotenv.get("MAIL_PROTOCOL"), "smtp");

        mailSender.setHost(host);
        mailSender.setPort(port);
        if (hasText(username)) mailSender.setUsername(username);
        if (hasText(password)) mailSender.setPassword(password);
        mailSender.setProtocol(protocol);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.smtp.auth", firstText(env.getProperty("spring.mail.properties.mail.smtp.auth"), env.getProperty("MAIL_SMTP_AUTH"), dotenv.get("MAIL_SMTP_AUTH"), "true"));
        props.put("mail.smtp.starttls.enable", firstText(env.getProperty("spring.mail.properties.mail.smtp.starttls.enable"), env.getProperty("MAIL_SMTP_STARTTLS"), dotenv.get("MAIL_SMTP_STARTTLS"), "true"));
        props.put("mail.smtp.ssl.trust", firstText(env.getProperty("spring.mail.properties.mail.smtp.ssl.trust"), env.getProperty("MAIL_SMTP_SSL_TRUST"), dotenv.get("MAIL_SMTP_SSL_TRUST"), host));
        props.put("mail.smtp.connectiontimeout", firstText(env.getProperty("spring.mail.properties.mail.smtp.connectiontimeout"), env.getProperty("MAIL_SMTP_CONNECTION_TIMEOUT"), dotenv.get("MAIL_SMTP_CONNECTION_TIMEOUT"), "10000"));
        props.put("mail.smtp.timeout", firstText(env.getProperty("spring.mail.properties.mail.smtp.timeout"), env.getProperty("MAIL_SMTP_TIMEOUT"), dotenv.get("MAIL_SMTP_TIMEOUT"), "10000"));
        props.put("mail.smtp.writetimeout", firstText(env.getProperty("spring.mail.properties.mail.smtp.writetimeout"), env.getProperty("MAIL_SMTP_WRITE_TIMEOUT"), dotenv.get("MAIL_SMTP_WRITE_TIMEOUT"), "10000"));
        String fromAddress = firstText(env.getProperty("app.mail.from"), env.getProperty("MAIL_FROM"), dotenv.get("MAIL_FROM"));
        if (hasText(fromAddress)) {
            props.put("vbas.mail.from", fromAddress);
        }
        if (mailProperties != null && mailProperties.getProperties() != null) {
            props.putAll(mailProperties.getProperties());
        }

        return mailSender;
    }

    private Map<String, String> loadDotEnv() {
        Path dotenvPath = Path.of(".env");
        if (!Files.isRegularFile(dotenvPath)) {
            return Map.of();
        }

        Map<String, String> values = new HashMap<>();
        try {
            for (String line : Files.readAllLines(dotenvPath)) {
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                    continue;
                }
                int separator = trimmed.indexOf('=');
                if (separator <= 0) {
                    continue;
                }
                String key = trimmed.substring(0, separator).trim();
                String value = trimmed.substring(separator + 1).trim();
                values.put(key, stripWrappingQuotes(value));
            }
        } catch (IOException ignored) {
            return Map.of();
        }
        return values;
    }

    private String stripWrappingQuotes(String value) {
        if (value.length() >= 2
                && ((value.startsWith("\"") && value.endsWith("\""))
                || (value.startsWith("'") && value.endsWith("'")))) {
            return value.substring(1, value.length() - 1);
        }
        return value;
    }

    private String firstText(String... values) {
        for (String value : values) {
            if (hasText(value)) {
                return value.trim();
            }
        }
        return null;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
