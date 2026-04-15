package com.itss.vbas.service;

import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.entity.RescueCompany;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.entity.RescueStaff;
import com.itss.vbas.enums.RescueRequestStatus;

public interface RequestSupportService {
    RescueCompany getCurrentCompany(Account account);

    RescueStaff getCurrentStaff(Account account);

    RequestAssignment getLatestAssignment(RescueRequest request);

    RescueCompany getAssignedCompany(RescueRequest request);

    void assertRequestParticipant(Account account, RescueRequest request);

    void assertAssignedCompany(RescueCompany company, RescueRequest request);

    void assertAssignedStaff(RescueStaff staff, RescueRequest request);

    RescueRequest changeRequestStatus(RescueRequest request, RescueRequestStatus newStatus, Account changedBy, String note);

    RequestAssignment getPendingAssignment(RescueRequest request);
}
