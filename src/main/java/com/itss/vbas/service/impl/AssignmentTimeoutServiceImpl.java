package com.itss.vbas.service.impl;

import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.enums.AssignmentStatus;
import com.itss.vbas.repository.RequestAssignmentRepository;
import com.itss.vbas.service.AssignmentTimeoutService;
import com.itss.vbas.util.TimeoutCalculator; 
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class AssignmentTimeoutServiceImpl implements AssignmentTimeoutService {

    private final RequestAssignmentRepository requestAssignmentRepository;

    public AssignmentTimeoutServiceImpl(RequestAssignmentRepository requestAssignmentRepository) {
        this.requestAssignmentRepository = requestAssignmentRepository;
    }

    @Override
    public void processTimeoutAssignments() {
        List<RequestAssignment> pendingAssignments =
                requestAssignmentRepository.findByStatusOrderByAssignedAtAsc(AssignmentStatus.PENDING);

        log.info("[Timeout Scheduler] Found {} PENDING assignments to check", pendingAssignments.size());

        for (RequestAssignment assignment : pendingAssignments) {
            try {
                checkAndHandleTimeout(assignment.getId());
            } catch (Exception ex) {
                log.error("[Timeout Scheduler] Error processing assignment id={}: {}",
                        assignment.getId(), ex.getMessage());
            }
        }
    }

    @Transactional
    public void checkAndHandleTimeout(Long assignmentId) {
        RequestAssignment assignment = requestAssignmentRepository.findById(assignmentId)
                .orElse(null);

        if (assignment == null) {
            log.warn("[Timeout] Assignment id={} not found, skipping", assignmentId);
            return;
        }

        if (assignment.getStatus() != AssignmentStatus.PENDING) {
            log.debug("[Timeout] Assignment id={} status={}, skipping", assignmentId, assignment.getStatus());
            return;
        }

        // 2. Thay thế logic tính toán tại đây bằng Static Method
        LocalDateTime expiresAt = TimeoutCalculator.calculateExpiresAt(assignment);
        
        if (LocalDateTime.now().isAfter(expiresAt)) {
            handleTimeout(assignment);
        }
    }

    private void handleTimeout(RequestAssignment assignment) {
        log.info("[Timeout] Assignment id={} (company={}, request={}) timed out → REJECTED",
                assignment.getId(),
                assignment.getCompany().getId(),
                assignment.getRequest().getId());

        assignment.setStatus(AssignmentStatus.REJECTED);
        assignment.setRejectedAt(LocalDateTime.now());
        requestAssignmentRepository.save(assignment);
    }
}