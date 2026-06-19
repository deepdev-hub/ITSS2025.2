package com.itss.vbas.security;

import java.util.Arrays;

import com.itss.vbas.entity.Account;
import com.itss.vbas.enums.AccountStatus;
import com.itss.vbas.exception.ForbiddenException;
import com.itss.vbas.exception.UnauthorizedException;
import com.itss.vbas.repository.AccountRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;
    private final AccountRepository accountRepository;

    public AuthInterceptor(JwtUtil jwtUtil, AccountRepository accountRepository) {
        this.jwtUtil = jwtUtil;
        this.accountRepository = accountRepository;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {

        String path = request.getRequestURI();

        // Allow public APIs
        if (path.startsWith("/api/auth/login") ||
                path.startsWith("/api/auth/register") ||
                path.startsWith("/api/auth/forgot-password") ||
                path.startsWith("/api/auth/verify-reset-otp") ||
                path.startsWith("/api/auth/reset-password")) {
            return true;
        }

        if (!"OPTIONS".equalsIgnoreCase(request.getMethod())) {
            CurrentUser currentUser = resolveCurrentUser(request);
            CurrentUserHolder.set(currentUser);
            enforceAuthorization(handler, currentUser);
        }

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        CurrentUserHolder.clear();
    }

    private CurrentUser resolveCurrentUser(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }

        String token = header.substring(7);
        try {
            CurrentUser currentUser = jwtUtil.parseToken(token);
            Account account = accountRepository.findById(currentUser.id())
                    .orElseThrow(() -> new UnauthorizedException("Account not found"));
            if (account.getStatus() != AccountStatus.ACTIVE) {
                throw new UnauthorizedException("Account is not active");
            }
            return new CurrentUser(account.getId(), account.getEmail(), account.getRole().getRoleName());
        } catch (JwtException | IllegalArgumentException ex) {
            throw new UnauthorizedException("Invalid or expired token");
        }
    }

    private void enforceAuthorization(Object handler, CurrentUser currentUser) {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return;
        }

        boolean requireAuth = handlerMethod.getMethodAnnotation(RequireAuth.class) != null
                || handlerMethod.getBeanType().getAnnotation(RequireAuth.class) != null;
        RequiredRoles requiredRoles = handlerMethod.getMethodAnnotation(RequiredRoles.class);
        if (requiredRoles == null) {
            requiredRoles = handlerMethod.getBeanType().getAnnotation(RequiredRoles.class);
        }

        if (requiredRoles != null) {
            requireAuth = true;
        }

        if (!requireAuth) {
            return;
        }

        if (currentUser == null) {
            throw new UnauthorizedException("Authentication is required");
        }

        if (requiredRoles != null && Arrays.stream(requiredRoles.value()).noneMatch(role -> role == currentUser.roleName())) {
            throw new ForbiddenException("You do not have permission to access this resource");
        }
    }
}
