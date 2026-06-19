package com.itss.vbas.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;

import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.entity.RescueCompany;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.entity.RescueStaff;
import com.itss.vbas.entity.RescueVehicle;
import com.itss.vbas.enums.AssignmentStatus;
import com.itss.vbas.enums.RescueRequestStatus;
import com.itss.vbas.enums.StaffStatus;
import org.junit.jupiter.api.Test;

class StaffAndTrackingIntegrationTest extends IntegrationTestSupport {

    @Test
    void staffCanAcceptAssignmentUpdateLocationAndExposeTracking() throws Exception {
        Account customer = createCustomer("tracking-customer@test.local");
        Account assignedBy = createAdmin();
        RescueCompany company = createCompany(createCompanyOwner());
        RescueStaff staff = createStaff(company, StaffStatus.ACTIVE, 21.030, 105.856);
        RescueStaff otherStaff = createStaff(company, StaffStatus.ACTIVE, 21.031, 105.857);
        RescueVehicle vehicle = createVehicle(company);
        RescueRequest request = createRescueRequest(customer, RescueRequestStatus.MATCHED);
        RequestAssignment assignment = createAssignment(
                request,
                company,
                staff,
                vehicle,
                assignedBy,
                AssignmentStatus.PENDING
        );
        RequestAssignment otherAssignment = createAssignment(
                request,
                company,
                otherStaff,
                vehicle,
                assignedBy,
                AssignmentStatus.PENDING
        );

        mockMvc.perform(put("/api/requests/assignments/{assignmentId}/accept", assignment.getId())
                        .header("Authorization", bearer(staff.getUser())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(put("/api/companies/staff/me/location")
                        .header("Authorization", bearer(staff.getUser()))
                        .contentType(jsonContentType())
                        .content(json(Map.of(
                                "latitude", 21.0286,
                                "longitude", 105.8543
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/requests/{id}/tracking", request.getId())
                        .header("Authorization", bearer(customer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.requestStatus").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.data.assigned").value(true))
                .andExpect(jsonPath("$.data.hasDestination").value(true))
                .andExpect(jsonPath("$.data.staff.id").value(staff.getId()))
                .andExpect(jsonPath("$.data.vehicle.plateNumber").value(vehicle.getPlateNumber()))
                .andExpect(jsonPath("$.data.route.length()").value(2))
                .andExpect(jsonPath("$.data.movementStatus").value("ARRIVED"))
                .andExpect(jsonPath("$.data.etaMinutes").value(0));

        RequestAssignment savedAssignment = requestAssignmentRepository.findById(assignment.getId()).orElseThrow();
        RequestAssignment savedOtherAssignment = requestAssignmentRepository.findById(otherAssignment.getId()).orElseThrow();
        RescueRequest savedRequest = rescueRequestRepository.findById(request.getId()).orElseThrow();
        assertEquals(AssignmentStatus.ACCEPTED, savedAssignment.getStatus());
        assertEquals(AssignmentStatus.REJECTED, savedOtherAssignment.getStatus());
        assertEquals(RescueRequestStatus.IN_PROGRESS, savedRequest.getStatus());
    }

    @Test
    void staffCanMoveAssignedRequestToCompleted() throws Exception {
        Account customer = createCustomer("status-customer@test.local");
        Account assignedBy = createAdmin();
        RescueCompany company = createCompany(createCompanyOwner());
        RescueStaff staff = createStaff(company, StaffStatus.ACTIVE, 21.030, 105.856);
        RescueVehicle vehicle = createVehicle(company);
        RescueRequest request = createRescueRequest(customer, RescueRequestStatus.ACCEPTED);
        RequestAssignment assignment = createAssignment(
                request,
                company,
                staff,
                vehicle,
                assignedBy,
                AssignmentStatus.ACCEPTED
        );

        mockMvc.perform(put("/api/requests/{id}/status", request.getId())
                        .header("Authorization", bearer(staff.getUser()))
                        .contentType(jsonContentType())
                        .content(json(Map.of(
                                "status", "IN_PROGRESS",
                                "note", "Technician is working"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"));

        mockMvc.perform(put("/api/requests/{id}/status", request.getId())
                        .header("Authorization", bearer(staff.getUser()))
                        .contentType(jsonContentType())
                        .content(json(Map.of(
                                "status", "COMPLETED",
                                "note", "Completed"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));

        RescueRequest savedRequest = rescueRequestRepository.findById(request.getId()).orElseThrow();
        RequestAssignment savedAssignment = requestAssignmentRepository.findById(assignment.getId()).orElseThrow();
        assertEquals(RescueRequestStatus.COMPLETED, savedRequest.getStatus());
        assertEquals(AssignmentStatus.COMPLETED, savedAssignment.getStatus());
    }
}
