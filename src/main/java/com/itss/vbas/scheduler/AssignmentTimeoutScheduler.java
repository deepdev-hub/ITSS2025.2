package com.itss.vbas.scheduler;

import com.itss.vbas.service.AssignmentTimeoutService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AssignmentTimeoutScheduler {

    private final AssignmentTimeoutService assignmentTimeoutService;

    public AssignmentTimeoutScheduler(AssignmentTimeoutService assignmentTimeoutService) {
        this.assignmentTimeoutService = assignmentTimeoutService;
    }

    @Scheduled(fixedDelayString = "${assignment.timeout-scheduler.fixed-delay:1000}")
    public void processTimeoutAssignments() {
        assignmentTimeoutService.processTimeoutAssignments();
    }
}
