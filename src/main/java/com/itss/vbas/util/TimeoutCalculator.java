package com.itss.vbas.util;

import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.enums.RequestPriority;

import java.time.LocalDateTime;

public final class TimeoutCalculator {

    private TimeoutCalculator() {}

    public static int getTimeoutMinutes(RequestPriority priority) {
        return switch (priority) {
            case EMERGENCY -> 3;
            case HIGH      -> 7;
            case NORMAL    -> 10;
            case LOW       -> 15;
        };
    }

    public static int getTimeoutSeconds(RequestPriority priority) {
        return getTimeoutMinutes(priority) * 60;
    }

    public static LocalDateTime calculateExpiresAt(RequestAssignment assignment) {
        int minutes = getTimeoutMinutes(assignment.getRequest().getPriorityLevel());
        return assignment.getAssignedAt().plusMinutes(minutes);
    }
}