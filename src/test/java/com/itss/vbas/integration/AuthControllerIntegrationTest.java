package com.itss.vbas.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import java.util.Map;

import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.PasswordResetToken;
import com.itss.vbas.enums.AccountStatus;
import com.itss.vbas.enums.RoleName;
import com.itss.vbas.repository.PasswordResetTokenRepository;
import com.itss.vbas.service.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;

class AuthControllerIntegrationTest extends IntegrationTestSupport {

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @MockBean
    private EmailService emailService;

    @Test
    void registerCustomerReturnsCreatedTokenAndProfile() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(jsonContentType())
                        .content(json(Map.of(
                                "email", "new.customer@test.local",
                                "password", PASSWORD,
                                "fullName", "New Customer",
                                "phone", "0901234567"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.user.email").value("new.customer@test.local"))
                .andExpect(jsonPath("$.data.user.roleName").value("CUSTOMER"));
    }

    @Test
    void registerWithDuplicateEmailReturnsBadRequest() throws Exception {
        createCustomer("duplicate@test.local");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(jsonContentType())
                        .content(json(Map.of(
                                "email", "duplicate@test.local",
                                "password", PASSWORD,
                                "fullName", "Duplicate Customer"
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void loginWithValidCredentialsReturnsToken() throws Exception {
        Account customer = createCustomer("login@test.local");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(jsonContentType())
                        .content(json(Map.of(
                                "email", customer.getEmail(),
                                "password", PASSWORD
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.user.id").value(customer.getId()));
    }

    @Test
    void loginWithWrongPasswordReturnsUnauthorized() throws Exception {
        Account customer = createCustomer("wrong-password@test.local");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(jsonContentType())
                        .content(json(Map.of(
                                "email", customer.getEmail(),
                                "password", "not-the-password"
                        ))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void loginWithBannedAccountReturnsUnauthorized() throws Exception {
        Account customer = createAccount(RoleName.CUSTOMER, "banned@test.local", AccountStatus.BANNED, null);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(jsonContentType())
                        .content(json(Map.of(
                                "email", customer.getEmail(),
                                "password", PASSWORD
                        ))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void currentProfileRequiresAndAcceptsBearerToken() throws Exception {
        Account customer = createCustomer("profile@test.local");

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", bearer(customer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(customer.getId()))
                .andExpect(jsonPath("$.data.email").value(customer.getEmail()));
    }

    @Test
    void forgotPasswordCreatesTokenAndReportsEmailSent() throws Exception {
        Account customer = createCustomer("forgot@test.local");
        when(emailService.sendResetPasswordEmail(anyString(), anyString())).thenReturn(true);

        mockMvc.perform(post("/api/auth/forgot-password")
                        .param("email", customer.getEmail()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Reset password link sent successfully"))
                .andExpect(jsonPath("$.data.resetLink").value(org.hamcrest.Matchers.nullValue()))
                .andExpect(jsonPath("$.data.emailSent").value(true));

        PasswordResetToken token = passwordResetTokenRepository.findAll().get(0);
        org.assertj.core.api.Assertions.assertThat(token.getUser().getId()).isEqualTo(customer.getId());
        org.assertj.core.api.Assertions.assertThat(token.getUsedAt()).isNull();
    }

    @Test
    void forgotPasswordReturnsBadRequestWhenEmailCannotBeSent() throws Exception {
        Account customer = createCustomer("forgot-local@test.local");
        when(emailService.sendResetPasswordEmail(anyString(), anyString())).thenReturn(false);

        mockMvc.perform(post("/api/auth/forgot-password")
                        .param("email", customer.getEmail()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        org.assertj.core.api.Assertions.assertThat(passwordResetTokenRepository.findAll()).isEmpty();
    }

    @Test
    void resetPasswordWithValidTokenUpdatesPasswordAndRejectsReuse() throws Exception {
        Account customer = createCustomer("reset@test.local");
        when(emailService.sendResetPasswordEmail(anyString(), anyString())).thenReturn(true);

        mockMvc.perform(post("/api/auth/forgot-password")
                        .param("email", customer.getEmail()))
                .andExpect(status().isOk());

        String token = passwordResetTokenRepository.findAll().get(0).getToken();

        mockMvc.perform(post("/api/auth/reset-password")
                        .param("token", token)
                        .param("newPassword", "NewPassword123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Password reset successfully"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(jsonContentType())
                        .content(json(Map.of(
                                "email", customer.getEmail(),
                                "password", "NewPassword123"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists());

        mockMvc.perform(post("/api/auth/reset-password")
                        .param("token", token)
                        .param("newPassword", "AnotherPassword123"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
