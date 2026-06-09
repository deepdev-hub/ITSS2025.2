package com.itss.vbas.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.RescueCompany;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.entity.RescueStaff;
import com.itss.vbas.enums.AssignmentStatus;
import com.itss.vbas.enums.RescueRequestStatus;
import com.itss.vbas.enums.StaffStatus;
import org.junit.jupiter.api.Test;

class SecurityIntegrationTest extends IntegrationTestSupport {

    @Test
    void protectedEndpointWithoutTokenReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/admin/roles"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void customerCannotCallAdminEndpoint() throws Exception {
        Account customer = createCustomer("customer-admin-denied@test.local");

        mockMvc.perform(get("/api/admin/roles")
                        .header("Authorization", bearer(customer)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void staffCannotAccessRequestAssignedToAnotherStaff() throws Exception {
        Account customer = createCustomer("security-request-owner@test.local");
        Account assignedBy = createAdmin();
        RescueCompany firstCompany = createCompany(createCompanyOwner());
        RescueStaff assignedStaff = createStaff(firstCompany, StaffStatus.ACTIVE, 21.030, 105.856);
        RescueCompany secondCompany = createCompany(createCompanyOwner());
        RescueStaff otherStaff = createStaff(secondCompany, StaffStatus.ACTIVE, 21.040, 105.866);
        RescueRequest request = createRescueRequest(customer, RescueRequestStatus.MATCHED);
        createAssignment(
                request,
                firstCompany,
                assignedStaff,
                null,
                assignedBy,
                AssignmentStatus.ACCEPTED
        );

        mockMvc.perform(get("/api/requests/{id}", request.getId())
                        .header("Authorization", bearer(otherStaff.getUser())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void invalidBearerTokenReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer not-a-valid-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }
}
