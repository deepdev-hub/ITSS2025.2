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
import com.itss.vbas.service.AdminService; // BỔ SUNG
import com.itss.vbas.service.AssignmentTimeoutService;
import org.springframework.context.annotation.Lazy; // BỔ SUNG
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AssignmentTimeoutServiceImpl implements AssignmentTimeoutService {

    private final RequestAssignmentRepository requestAssignmentRepository;
    private final RescueRequestRepository rescueRequestRepository;
    private final RequestStatusHistoryRepository requestStatusHistoryRepository;
    private final AssignmentTimeoutConfig assignmentTimeoutConfig;
    private final AdminService adminService; // BỔ SUNG

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

    // Logic giải phóng ca cũ và tự động tìm người tiếp theo
    private void releaseRequestAndAssignNext(RequestAssignment assignment) {
        RescueRequest request = assignment.getRequest();
        boolean isLatestAssignment = requestAssignmentRepository.findFirstByRequestIdOrderByAssignedAtDesc(request.getId())
                .map(latest -> latest.getId().equals(assignment.getId()))
                .orElse(false);
                
        if (!isLatestAssignment || request.getStatus() != RescueRequestStatus.MATCHED) {
            return;
        }

        RescueRequestStatus oldStatus = request.getStatus();
        request.setStatus(RescueRequestStatus.SEARCHING); // Tạm thời đưa về SEARCHING
        RescueRequest savedRequest = rescueRequestRepository.save(request);
        
        requestStatusHistoryRepository.save(RequestStatusHistory.builder()
                .request(savedRequest)
                .oldStatus(oldStatus)
                .newStatus(RescueRequestStatus.SEARCHING)
                .changedByUser(assignment.getAssignedByUser())
                .note("Assignment timed out. Đang tự động tìm kiếm nhân viên tiếp theo...")
                .build());

        // TỰ ĐỘNG GỌI ĐIỀU PHỐI NGƯỜI TIẾP THEO
        adminService.autoAssignNearestStaff(savedRequest.getId());
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