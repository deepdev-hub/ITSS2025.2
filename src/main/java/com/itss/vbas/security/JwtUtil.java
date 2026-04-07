package com.itss.vbas.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;

import com.itss.vbas.enums.RoleName;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-hours}")
    private long expirationHours;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secret);
        } catch (IllegalArgumentException ex) {
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }
        this.secretKey = Keys.hmacShaKeyFor(normalizeKey(keyBytes));
    }

    public String generateToken(CurrentUser currentUser) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(currentUser.id()))
                .claims(Map.of(
                        "email", currentUser.email(),
                        "role", currentUser.roleName().name()
                ))
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expirationHours, ChronoUnit.HOURS)))
                .signWith(secretKey)
                .compact();
    }

    public CurrentUser parseToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return new CurrentUser(
                Long.parseLong(claims.getSubject()),
                claims.get("email", String.class),
                RoleName.valueOf(claims.get("role", String.class))
        );
    }

    private byte[] normalizeKey(byte[] source) {
        if (source.length >= 32) {
            return source;
        }
        byte[] expanded = new byte[32];
        for (int i = 0; i < expanded.length; i++) {
            expanded[i] = source[i % source.length];
        }
        return expanded;
    }
}
