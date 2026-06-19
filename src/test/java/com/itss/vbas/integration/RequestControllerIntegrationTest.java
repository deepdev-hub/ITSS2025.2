package com.itss.vbas.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.IncidentType;
import com.itss.vbas.entity.Notification;
import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.entity.RescueCompany;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.entity.RescueStaff;
import com.itss.vbas.entity.ServiceType;
import com.itss.vbas.enums.AssignmentStatus;
import com.itss.vbas.enums.NotificationType;
import com.itss.vbas.enums.RescueRequestStatus;
import com.itss.vbas.enums.StaffStatus;
import org.junit.jupiter.api.Test;

class RequestControllerIntegrationTest extends IntegrationTestSupport {

    @Test
    void customerCanCreateRequestWithValidData() throws Exception {
        Account customer = createCustomer("request-create@test.local");
        IncidentType incidentType = createIncidentType();
        ServiceType serviceType = createServiceType();

        mockMvc.perform(post("/api/requests")
                        .header("Authorization", bearer(customer))
                        .contentType(jsonContentType())
                        .content(json(requestBody(incidentType, serviceType))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.customer.id").value(customer.getId()))
                .andExpect(jsonPath("$.data.status").value("SEARCHING"));
    }

    @Test
    void creatingRequestDispatchesFiveNearbyStaffButKeepsRequestSearching() throws Exception {
        Account customer = createCustomer("request-dispatch-customer@test.local");
        RescueCompany company = createCompany(createCompanyOwner());
        for (int i = 0; i < 6; i++) {
            createStaff(company, StaffStatus.ACTIVE, 21.0285 + (i * 0.001), 105.8542 + (i * 0.001));
        }

        mockMvc.perform(post("/api/requests")
                        .header("Authorization", bearer(customer))
                        .contentType(jsonContentType())
                        .content(json(requestBody(createIncidentType(), createServiceType()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("SEARCHING"));

        RescueRequest savedRequest = rescueRequestRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).get(0);
        List<RequestAssignment> assignments = requestAssignmentRepository.findByRequestId(savedRequest.getId());

        assertEquals(RescueRequestStatus.SEARCHING, savedRequest.getStatus());
        assertEquals(5, assignments.size());
        org.assertj.core.api.Assertions.assertThat(assignments)
                .allMatch(assignment -> assignment.getStatus() == AssignmentStatus.PENDING)
                .allMatch(assignment -> assignment.getVehicle() != null);
    }

    @Test
    void creatingRequestCreatesPendingNotificationForAssignedStaff() throws Exception {
        Account customer = createCustomer("request-notification-customer@test.local");
        RescueCompany company = createCompany(createCompanyOwner());
        RescueStaff assignedStaff = createStaff(company, StaffStatus.ACTIVE, 21.0285, 105.8542);

        mockMvc.perform(post("/api/requests")
                        .header("Authorization", bearer(customer))
                        .contentType(jsonContentType())
                        .content(json(requestBody(createIncidentType(), createServiceType()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));

        RescueRequest savedRequest = rescueRequestRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).get(0);
        RequestAssignment assignment = requestAssignmentRepository.findByRequestId(savedRequest.getId()).get(0);

        List<Notification> staffNotifications = notificationRepository
                .findTop20ByRecipientIdOrderByCreatedAtDesc(assignedStaff.getUser().getId());

        org.assertj.core.api.Assertions.assertThat(staffNotifications)
                .anySatisfy(notification -> {
                    org.assertj.core.api.Assertions.assertThat(notification.getType()).isEqualTo(NotificationType.ASSIGNMENT_PENDING);
                    org.assertj.core.api.Assertions.assertThat(notification.getRequest()).isNotNull();
                    org.assertj.core.api.Assertions.assertThat(notification.getRequest().getId()).isEqualTo(savedRequest.getId());
                    org.assertj.core.api.Assertions.assertThat(notification.isRead()).isFalse();
                });
        assertEquals(AssignmentStatus.PENDING, assignment.getStatus());
    }

    @Test
    void createRequestWithoutLocationReturnsBadRequest() throws Exception {
        Account customer = createCustomer("request-missing-location@test.local");
        Map<String, Object> body = new LinkedHashMap<>(requestBody(createIncidentType(), createServiceType()));
        body.remove("location");

        mockMvc.perform(post("/api/requests")
                        .header("Authorization", bearer(customer))
                        .contentType(jsonContentType())
                        .content(json(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void customerCanSeeOnlyOwnRequests() throws Exception {
        Account customer = createCustomer("request-list-owner@test.local");
        Account otherCustomer = createCustomer("request-list-other@test.local");
        RescueRequest ownRequest = createRescueRequest(customer, RescueRequestStatus.SEARCHING);
        createRescueRequest(otherCustomer, RescueRequestStatus.SEARCHING);

        mockMvc.perform(get("/api/requests/my")
                        .header("Authorization", bearer(customer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(ownRequest.getId()))
                .andExpect(jsonPath("$.data[0].customerName").value(customer.getFullName()));
    }

    @Test
    void customerCanViewOwnRequestDetail() throws Exception {
        Account customer = createCustomer("request-detail@test.local");
        RescueRequest request = createRescueRequest(customer, RescueRequestStatus.SEARCHING);

        mockMvc.perform(get("/api/requests/{id}", request.getId())
                        .header("Authorization", bearer(customer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(request.getId()))
                .andExpect(jsonPath("$.data.customer.id").value(customer.getId()));
    }

    @Test
    void customerCannotViewAnotherCustomersRequest() throws Exception {
        Account owner = createCustomer("request-owner@test.local");
        Account otherCustomer = createCustomer("request-intruder@test.local");
        RescueRequest request = createRescueRequest(owner, RescueRequestStatus.SEARCHING);

        mockMvc.perform(get("/api/requests/{id}", request.getId())
                        .header("Authorization", bearer(otherCustomer)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void customerCanCancelOpenRequest() throws Exception {
        Account customer = createCustomer("request-cancel@test.local");
        RescueRequest request = createRescueRequest(customer, RescueRequestStatus.SEARCHING);

        mockMvc.perform(patch("/api/requests/{id}/cancel", request.getId())
                        .header("Authorization", bearer(customer))
                        .contentType(jsonContentType())
                        .content(json(Map.of("note", "No longer needed"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        RescueRequest saved = rescueRequestRepository.findById(request.getId()).orElseThrow();
        assertEquals(RescueRequestStatus.CANCELED, saved.getStatus());
    }

    @Test
    void customerCannotCancelCompletedRequest() throws Exception {
        Account customer = createCustomer("request-cancel-completed@test.local");
        RescueRequest request = createRescueRequest(customer, RescueRequestStatus.COMPLETED);

        mockMvc.perform(patch("/api/requests/{id}/cancel", request.getId())
                        .header("Authorization", bearer(customer))
                        .contentType(jsonContentType())
                        .content(json(Map.of("note", "Cancel completed"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
