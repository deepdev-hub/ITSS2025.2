package com.itss.vbas.scheduler;

import com.itss.vbas.service.AssignmentTimeoutService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class AssignmentTimeoutScheduler {

    private final AssignmentTimeoutService assignmentTimeoutService;

    public AssignmentTimeoutScheduler(AssignmentTimeoutService assignmentTimeoutService) {
        this.assignmentTimeoutService = assignmentTimeoutService;
    }

    /**
     * Chạy mỗi 60 giây.
     * fixedDelay đảm bảo không overlap nếu lần trước chạy lâu hơn 60s.
     */
    @Scheduled(fixedDelay = 60_000)
    public void runTimeoutCheck() {
        log.info("[Timeout Scheduler] Running assignment timeout check...");
        try {
            assignmentTimeoutService.processTimeoutAssignments();
        } catch (Exception ex) {
            log.error("[Timeout Scheduler] Unexpected error: {}", ex.getMessage(), ex);
        }
    }
}