package com.itss.vbas.integration;

import static org.hamcrest.Matchers.hasItems;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.Map;

import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.entity.RescueCompany;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.entity.RescueStaff;
import com.itss.vbas.enums.AssignmentStatus;
import com.itss.vbas.enums.RescueRequestStatus;
import com.itss.vbas.enums.StaffStatus;
import org.junit.jupiter.api.Test;

class AdminControllerIntegrationTest extends IntegrationTestSupport {

    @Test
    void adminCanListDefaultRoles() throws Exception {
        Account admin = createAdmin();

        mockMvc.perform(get("/api/admin/roles")
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(4))
                .andExpect(jsonPath("$.data[*].roleName").value(hasItems(
                        "ADMIN",
                        "CUSTOMER",
                        "RESCUE_COMPANY",
                        "RESCUE_STAFF"
                )));
    }

    @Test
    void creatingDuplicateRoleReturnsBadRequest() throws Exception {
        Account admin = createAdmin();

        mockMvc.perform(post("/api/admin/roles")
                        .header("Authorization", bearer(admin))
                        .contentType(jsonContentType())
                        .content(json(Map.of("roleName", "ADMIN"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void adminCanListAccountsAndBlockThenUnblockAccount() throws Exception {
        Account admin = createAdmin();
        Account customer = createCustomer("admin-accounts-customer@test.local");

        mockMvc.perform(get("/api/admin/accounts")
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[*].id").value(hasItems(
                        admin.getId().intValue(),
                        customer.getId().intValue()
                )));

        mockMvc.perform(put("/api/admin/accounts/{id}/block", customer.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("BANNED"));

        mockMvc.perform(put("/api/admin/accounts/{id}/unblock", customer.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    void adminCreateAccountRejectsDuplicateCccd() throws Exception {
        Account admin = createAdmin();
        Account existingCustomer = createCustomer("existing-admin-cccd@test.local");

        mockMvc.perform(post("/api/admin/accounts")
                        .header("Authorization", bearer(admin))
                        .contentType(jsonContentType())
                        .content(json(Map.of(
                                "email", "new-admin-account@test.local",
                                "password", PASSWORD,
                                "fullName", "New Account",
                                "roleName", "CUSTOMER",
                                "status", "ACTIVE",
                                "dateOfBirth", LocalDate.now().minusYears(25).toString(),
                                "cccd", existingCustomer.getCccd(),
                                "defaultAddress", addressBody(21.0285, 105.8542)
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("CCCD is already in use"));
    }

    @Test
    void adminUpdateAccountRejectsDuplicateCccd() throws Exception {
        Account admin = createAdmin();
        Account firstCustomer = createCustomer("first-update-cccd@test.local");
        Account secondCustomer = createCustomer("second-update-cccd@test.local");

        mockMvc.perform(put("/api/admin/accounts/{id}", secondCustomer.getId())
                        .header("Authorization", bearer(admin))
                        .contentType(jsonContentType())
                        .content(json(Map.of(
                                "email", secondCustomer.getEmail(),
                                "fullName", secondCustomer.getFullName(),
                                "phone", secondCustomer.getPhone(),
                                "avatarUrl", "",
                                "roleName", secondCustomer.getRole().getRoleName().name(),
                                "status", secondCustomer.getStatus().name(),
                                "dateOfBirth", LocalDate.now().minusYears(23).toString(),
                                "gender", "",
                                "cccd", firstCustomer.getCccd(),
                                "defaultAddress", addressBody(21.0285, 105.8542)
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("CCCD is already in use"));
    }

    @Test
    void adminCanAssignStaffToRequest() throws Exception {
        Account admin = createAdmin();
        Account customer = createCustomer("admin-assign-customer@test.local");
        RescueCompany company = createCompany(createCompanyOwner());
        RescueStaff staff = createStaff(company, StaffStatus.ACTIVE, 21.029, 105.855);
        RescueRequest request = createRescueRequest(customer, RescueRequestStatus.SEARCHING);

        mockMvc.perform(put("/api/admin/requests/{id}/assign-staff", request.getId())
                        .header("Authorization", bearer(admin))
                        .contentType(jsonContentType())
                        .content(json(Map.of(
                                "staffId", staff.getId(),
                                "note", "Assign from integration test"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.requestId").value(request.getId()))
                .andExpect(jsonPath("$.data.staffId").value(staff.getId()))
                .andExpect(jsonPath("$.data.status").value("PENDING"));

        RescueRequest savedRequest = rescueRequestRepository.findById(request.getId()).orElseThrow();
        assertEquals(RescueRequestStatus.SEARCHING, savedRequest.getStatus());

        RequestAssignment savedAssignment = requestAssignmentRepository
                .findFirstByRequestIdOrderByAssignedAtDesc(request.getId())
                .orElseThrow();
        assertEquals(AssignmentStatus.PENDING, savedAssignment.getStatus());
        assertEquals(admin.getId(), savedAssignment.getAssignedByUser().getId());
        assertNotNull(savedAssignment.getCompany());
        assertNotNull(savedAssignment.getVehicle());
    }

    @Test
    void adminDashboardReturnsStatisticsPayload() throws Exception {
        Account admin = createAdmin();
        createRescueRequest(createCustomer("dashboard-customer@test.local"), RescueRequestStatus.SEARCHING);

        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").exists());
    }
}
