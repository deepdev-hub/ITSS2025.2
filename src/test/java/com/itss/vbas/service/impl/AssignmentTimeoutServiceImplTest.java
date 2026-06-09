package com.itss.vbas.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import com.itss.vbas.config.AssignmentTimeoutConfig;
import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.entity.RequestStatusHistory;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.enums.AssignmentStatus;
import com.itss.vbas.enums.RequestPriority;
import com.itss.vbas.enums.RescueRequestStatus;
import com.itss.vbas.repository.RequestAssignmentRepository;
import com.itss.vbas.repository.RequestStatusHistoryRepository;
import com.itss.vbas.repository.RescueRequestRepository;
import com.itss.vbas.service.AdminService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AssignmentTimeoutServiceImplTest {

    @Mock
    private RequestAssignmentRepository requestAssignmentRepository;
    @Mock
    private RescueRequestRepository rescueRequestRepository;
    @Mock
    private RequestStatusHistoryRepository requestStatusHistoryRepository;
    private AssignmentTimeoutConfig assignmentTimeoutConfig;
    @Mock
    private AdminService adminService;

    private AssignmentTimeoutServiceImpl timeoutService;

    @BeforeEach
    void setUp() {
        assignmentTimeoutConfig = new AssignmentTimeoutConfig();
        timeoutService = new AssignmentTimeoutServiceImpl(
                requestAssignmentRepository,
                rescueRequestRepository,
                requestStatusHistoryRepository,
                assignmentTimeoutConfig,
                adminService
        );
    }

    @Test
    void timedOutAssignmentPassesExistingAuditActorToAutoAssignment() {
        Account actor = Account.builder().id(73L).fullName("System Admin").build();
        Account customer = Account.builder().id(75L).fullName("Demo Customer").build();
        RescueRequest request = RescueRequest.builder()
                .id(124L)
                .customer(customer)
                .priorityLevel(RequestPriority.NORMAL)
                .status(RescueRequestStatus.MATCHED)
                .build();
        RequestAssignment assignment = RequestAssignment.builder()
                .id(501L)
                .request(request)
                .assignedByUser(actor)
                .status(AssignmentStatus.PENDING)
                .assignedAt(LocalDateTime.now().minusMinutes(6))
                .build();

        when(requestAssignmentRepository.save(assignment)).thenReturn(assignment);
        when(requestAssignmentRepository.findFirstByRequestIdOrderByAssignedAtDesc(124L))
                .thenReturn(Optional.of(assignment));
        when(rescueRequestRepository.save(request)).thenReturn(request);

        timeoutService.expireIfPendingTimedOut(assignment);

        assertEquals(AssignmentStatus.REJECTED, assignment.getStatus());
        assertEquals(RescueRequestStatus.SEARCHING, request.getStatus());
        verify(adminService).autoAssignNearestStaff(124L, 73L);
        verify(adminService, never()).autoAssignNearestStaff(124L);

        ArgumentCaptor<RequestStatusHistory> historyCaptor = ArgumentCaptor.forClass(RequestStatusHistory.class);
        verify(requestStatusHistoryRepository).save(historyCaptor.capture());
        assertSame(actor, historyCaptor.getValue().getChangedByUser());
    }
}
