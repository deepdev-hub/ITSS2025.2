package com.itss.vbas.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;

import com.itss.vbas.entity.Account;
import com.itss.vbas.enums.AccountStatus;
import com.itss.vbas.enums.RoleName;
import org.junit.jupiter.api.Test;

class AuthControllerIntegrationTest extends IntegrationTestSupport {

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
}
