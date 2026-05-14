package com.itss.vbas.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.mail.MailProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

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

        String host = mailProperties != null ? mailProperties.getHost() : env.getProperty("spring.mail.host", "smtp.gmail.com");
        Integer port = mailProperties != null && mailProperties.getPort() != null ? mailProperties.getPort() : Integer.parseInt(env.getProperty("spring.mail.port", "587"));
        String username = mailProperties != null ? mailProperties.getUsername() : env.getProperty("spring.mail.username");
        String password = mailProperties != null ? mailProperties.getPassword() : env.getProperty("spring.mail.password");
        String protocol = mailProperties != null ? mailProperties.getProtocol() : env.getProperty("spring.mail.protocol", "smtp");

        mailSender.setHost(host);
        mailSender.setPort(port);
        if (username != null) mailSender.setUsername(username);
        if (password != null) mailSender.setPassword(password);
        mailSender.setProtocol(protocol);

        Properties props = mailSender.getJavaMailProperties();
        if (mailProperties != null && mailProperties.getProperties() != null) {
            props.putAll(mailProperties.getProperties());
        } else {
            props.put("mail.smtp.auth", env.getProperty("spring.mail.properties.mail.smtp.auth", "true"));
            props.put("mail.smtp.starttls.enable", env.getProperty("spring.mail.properties.mail.smtp.starttls.enable", "true"));
            props.put("mail.smtp.ssl.trust", env.getProperty("spring.mail.properties.mail.smtp.ssl.trust", "*"));
        }

        return mailSender;
    }
}
