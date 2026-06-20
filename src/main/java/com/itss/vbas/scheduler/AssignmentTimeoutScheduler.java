package com.itss.vbas.scheduler;

import com.itss.vbas.service.AssignmentTimeoutService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.itss.vbas.enums.AssignmentStatus;
import com.itss.vbas.enums.StaffStatus;
import com.itss.vbas.repository.RequestAssignmentRepository;
import com.itss.vbas.repository.RescueStaffRepository;

@Component
public class AssignmentTimeoutScheduler {

    private final AssignmentTimeoutService assignmentTimeoutService;
    private final RescueStaffRepository rescueStaffRepository;
    private final RequestAssignmentRepository requestAssignmentRepository;

    public AssignmentTimeoutScheduler(
            AssignmentTimeoutService assignmentTimeoutService,
            RescueStaffRepository rescueStaffRepository,
            RequestAssignmentRepository requestAssignmentRepository) {
        this.assignmentTimeoutService = assignmentTimeoutService;
        this.rescueStaffRepository = rescueStaffRepository;
        this.requestAssignmentRepository = requestAssignmentRepository;
    }

    @Scheduled(fixedDelayString = "${assignment.timeout-scheduler.fixed-delay:1000}")
    public void processTimeoutAssignments() {
        assignmentTimeoutService.processTimeoutAssignments();
    }

    @Scheduled(fixedDelay = 10000)
    public void healStuckStaffStatus() {
        rescueStaffRepository.findByStatus(StaffStatus.BUSY).forEach(staff -> {
            boolean trulyBusy = requestAssignmentRepository.existsByStaffIdAndStatusIn(
                    staff.getId(),
                    java.util.List.of(AssignmentStatus.PENDING, AssignmentStatus.ACCEPTED)
            );
            if (!trulyBusy) {
                staff.setStatus(StaffStatus.ACTIVE);
                rescueStaffRepository.save(staff);
            }
        });
    }
}
