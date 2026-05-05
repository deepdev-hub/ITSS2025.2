package com.itss.vbas.service;

import java.time.LocalDateTime;

import com.itss.vbas.entity.RequestAssignment;

public interface AssignmentTimeoutService {
    void processTimeoutAssignments();

    RequestAssignment expireIfPendingTimedOut(RequestAssignment assignment);

    int getTimeoutSeconds(RequestAssignment assignment);

    LocalDateTime getExpiresAt(RequestAssignment assignment);
}
