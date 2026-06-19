package com.itss.vbas.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import com.itss.vbas.config.AssignmentTimeoutConfig;
import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.entity.RequestStatusHistory;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.enums.AssignmentStatus;
import com.itss.vbas.enums.RescueRequestStatus;
import com.itss.vbas.repository.RequestAssignmentRepository;
import com.itss.vbas.repository.RequestStatusHistoryRepository;
import com.itss.vbas.repository.RescueRequestRepository;
import com.itss.vbas.service.AdminService;
import com.itss.vbas.service.AssignmentTimeoutService;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AssignmentTimeoutServiceImpl implements AssignmentTimeoutService {

    private final RequestAssignmentRepository requestAssignmentRepository;
    private final RescueRequestRepository rescueRequestRepository;
    private final RequestStatusHistoryRepository requestStatusHistoryRepository;
    private final AssignmentTimeoutConfig assignmentTimeoutConfig;
    private final AdminService adminService;

    public AssignmentTimeoutServiceImpl(
            RequestAssignmentRepository requestAssignmentRepository,
            RescueRequestRepository rescueRequestRepository,
            RequestStatusHistoryRepository requestStatusHistoryRepository,
            AssignmentTimeoutConfig assignmentTimeoutConfig,
            @Lazy AdminService adminService 
    ) {
        this.requestAssignmentRepository = requestAssignmentRepository;
        this.rescueRequestRepository = rescueRequestRepository;
        this.requestStatusHistoryRepository = requestStatusHistoryRepository;
        this.assignmentTimeoutConfig = assignmentTimeoutConfig;
        this.adminService = adminService;
    }

    @Override
    public void processTimeoutAssignments() {
        List<RequestAssignment> pendingAssignments = requestAssignmentRepository.findByStatusOrderByAssignedAtAsc(AssignmentStatus.PENDING);
        pendingAssignments.forEach(this::expireIfPendingTimedOut);
        assignSearchingRequestsWithoutOpenAssignments();
    }

    @Override
    public RequestAssignment expireIfPendingTimedOut(RequestAssignment assignment) {
        if (assignment == null || assignment.getStatus() != AssignmentStatus.PENDING) {
            return assignment;
        }

        LocalDateTime expiresAt = getExpiresAt(assignment);
        if (expiresAt != null && !LocalDateTime.now().isBefore(expiresAt)) {
            assignment.setStatus(AssignmentStatus.REJECTED);
            assignment.setRejectedAt(LocalDateTime.now());
            RequestAssignment savedAssignment = requestAssignmentRepository.save(assignment);
            releaseRequestAndAssignNext(savedAssignment); 
            return savedAssignment;
        }
        return assignment;
    }

    private void releaseRequestAndAssignNext(RequestAssignment assignment) {
        RescueRequest request = assignment.getRequest();
        if (request.getStatus() == RescueRequestStatus.IN_PROGRESS
                || request.getStatus() == RescueRequestStatus.COMPLETED
                || request.getStatus() == RescueRequestStatus.CANCELED
                || hasAcceptedAssignment(request)
                || hasPendingAssignment(request)) {
            return;
        }

        RescueRequestStatus oldStatus = request.getStatus();
        request.setStatus(RescueRequestStatus.SEARCHING);
        RescueRequest savedRequest = rescueRequestRepository.save(request);

        if (oldStatus != RescueRequestStatus.SEARCHING) {
            requestStatusHistoryRepository.save(RequestStatusHistory.builder()
                    .request(savedRequest)
                    .oldStatus(oldStatus)
                    .newStatus(RescueRequestStatus.SEARCHING)
                    .changedByUser(assignment.getAssignedByUser())
                    .note("Assignment timed out. Searching for nearby staff again.")
                    .build());
        }

        Long assignedByAccountId = assignment.getAssignedByUser() != null
                ? assignment.getAssignedByUser().getId()
                : savedRequest.getCustomer().getId();
        adminService.autoAssignNearestStaff(savedRequest.getId(), assignedByAccountId);
    }

    private void assignSearchingRequestsWithoutOpenAssignments() {
        rescueRequestRepository.findByStatus(RescueRequestStatus.SEARCHING).forEach(request -> {
            if (hasDispatchableLocation(request) && !hasPendingAssignment(request) && !hasAcceptedAssignment(request)) {
                adminService.autoAssignNearestStaff(request.getId(), request.getCustomer().getId());
            }
        });
    }

    private boolean hasDispatchableLocation(RescueRequest request) {
        return request.getLocation() != null
                && request.getLocation().getLatitude() != null
                && request.getLocation().getLongitude() != null;
    }

    private boolean hasPendingAssignment(RescueRequest request) {
        return requestAssignmentRepository.existsByRequestIdAndStatus(request.getId(), AssignmentStatus.PENDING);
    }

    private boolean hasAcceptedAssignment(RescueRequest request) {
        return requestAssignmentRepository.existsByRequestIdAndStatus(request.getId(), AssignmentStatus.ACCEPTED);
    }

    @Override
    @Transactional(readOnly = true)
    public int getTimeoutSeconds(RequestAssignment assignment) {
        if (assignment == null || assignment.getRequest() == null || assignment.getRequest().getPriorityLevel() == null) {
            return 0;
        }
        return Math.toIntExact(assignmentTimeoutConfig.getTimeout(assignment.getRequest().getPriorityLevel()).toSeconds());
    }

    @Override
    @Transactional(readOnly = true)
    public LocalDateTime getExpiresAt(RequestAssignment assignment) {
        if (assignment == null || assignment.getAssignedAt() == null) {
            return null;
        }
        return assignment.getAssignedAt().plusSeconds(getTimeoutSeconds(assignment));
    }
}
