package com.itss.vbas.service.impl;

import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.entity.RequestStatusHistory;
import com.itss.vbas.entity.RescueCompany;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.entity.RescueStaff;
import com.itss.vbas.enums.AssignmentStatus;
import com.itss.vbas.enums.RescueRequestStatus;
import com.itss.vbas.enums.RoleName;
import com.itss.vbas.exception.ForbiddenException;
import com.itss.vbas.exception.ResourceNotFoundException;
import com.itss.vbas.repository.RequestAssignmentRepository;
import com.itss.vbas.repository.RequestStatusHistoryRepository;
import com.itss.vbas.repository.RescueCompanyRepository;
import com.itss.vbas.repository.RescueRequestRepository;
import com.itss.vbas.repository.RescueStaffRepository;
import com.itss.vbas.service.RequestSupportService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RequestSupportServiceImpl implements RequestSupportService {

    private final RescueCompanyRepository rescueCompanyRepository;
    private final RescueStaffRepository rescueStaffRepository;
    private final RequestAssignmentRepository requestAssignmentRepository;
    private final RequestStatusHistoryRepository requestStatusHistoryRepository;
    private final RescueRequestRepository rescueRequestRepository;

    public RequestSupportServiceImpl(
            RescueCompanyRepository rescueCompanyRepository,
            RescueStaffRepository rescueStaffRepository,
            RequestAssignmentRepository requestAssignmentRepository,
            RequestStatusHistoryRepository requestStatusHistoryRepository,
            RescueRequestRepository rescueRequestRepository
    ) {
        this.rescueCompanyRepository = rescueCompanyRepository;
        this.rescueStaffRepository = rescueStaffRepository;
        this.requestAssignmentRepository = requestAssignmentRepository;
        this.requestStatusHistoryRepository = requestStatusHistoryRepository;
        this.rescueRequestRepository = rescueRequestRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public RescueCompany getCurrentCompany(Account account) {
        return rescueCompanyRepository.findByOwnerAccountId(account.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No rescue company profile was found for this account"));
    }

    @Override
    @Transactional(readOnly = true)
    public RescueStaff getCurrentStaff(Account account) {
        return rescueStaffRepository.findByUserId(account.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No rescue staff profile was found for this account"));
    }

    @Override
    @Transactional(readOnly = true)
    public RequestAssignment getLatestAssignment(RescueRequest request) {
        return requestAssignmentRepository.findFirstByRequestIdAndStatusOrderByAssignedAtDesc(request.getId(), AssignmentStatus.ACCEPTED)
                .or(() -> requestAssignmentRepository.findFirstByRequestIdAndStatusOrderByAssignedAtDesc(request.getId(), AssignmentStatus.PENDING))
                .or(() -> requestAssignmentRepository.findFirstByRequestIdAndStatusOrderByAssignedAtDesc(request.getId(), AssignmentStatus.COMPLETED))
                .or(() -> requestAssignmentRepository.findFirstByRequestIdOrderByAssignedAtDesc(request.getId()))
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public RescueCompany getAssignedCompany(RescueRequest request) {
        RequestAssignment assignment = requestAssignmentRepository
                .findFirstByRequestIdAndStatusOrderByAssignedAtDesc(request.getId(), AssignmentStatus.ACCEPTED)
                .or(() -> requestAssignmentRepository.findFirstByRequestIdAndStatusOrderByAssignedAtDesc(request.getId(), AssignmentStatus.COMPLETED))
                .orElse(null);
        return assignment == null ? null : assignment.getCompany();
    }

    @Override
    @Transactional(readOnly = true)
    public void assertRequestParticipant(Account account, RescueRequest request) {
        RoleName roleName = account.getRole().getRoleName();
        if (roleName == RoleName.ADMIN) {
            return;
        }
        if (roleName == RoleName.CUSTOMER && request.getCustomer().getId().equals(account.getId())) {
            return;
        }
        if (roleName == RoleName.RESCUE_COMPANY) {
            RescueCompany company = getCurrentCompany(account);
            assertAssignedCompany(company, request);
            return;
        }
        if (roleName == RoleName.RESCUE_STAFF) {
            RescueStaff staff = getCurrentStaff(account);
            assertAssignedStaff(staff, request);
            return;
        }
        throw new ForbiddenException("You are not allowed to access this request");
    }

    @Override
    @Transactional(readOnly = true)
    public void assertAssignedCompany(RescueCompany company, RescueRequest request) {
        RequestAssignment assignment = requestAssignmentRepository
                .findFirstByRequestIdAndCompanyIdOrderByAssignedAtDesc(request.getId(), company.getId())
                .orElse(null);
        if (assignment == null) {
            throw new ForbiddenException("This request is not assigned to your company");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public void assertAssignedStaff(RescueStaff staff, RescueRequest request) {
        RequestAssignment assignment = requestAssignmentRepository
                .findFirstByRequestIdAndStaffIdOrderByAssignedAtDesc(request.getId(), staff.getId())
                .orElse(null);
        if (assignment == null) {
            throw new ForbiddenException("This request is not assigned to you");
        }
    }

    @Override
    public RescueRequest changeRequestStatus(RescueRequest request, RescueRequestStatus newStatus, Account changedBy, String note) {
        RescueRequestStatus oldStatus = request.getStatus();
        if (oldStatus == newStatus) {
            return request;
        }

        request.setStatus(newStatus);
        RescueRequest savedRequest = rescueRequestRepository.save(request);
        requestStatusHistoryRepository.save(RequestStatusHistory.builder()
                .request(savedRequest)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .changedByUser(changedBy)
                .note(note)
                .build());

        // Update active assignment if request is completed or canceled
        if (newStatus == RescueRequestStatus.COMPLETED || newStatus == RescueRequestStatus.CANCELED) {
            requestAssignmentRepository.findFirstByRequestIdOrderByAssignedAtDesc(request.getId())
                    .ifPresent(assignment -> {
                        if (assignment.getStatus() != AssignmentStatus.COMPLETED && assignment.getStatus() != AssignmentStatus.REJECTED) {
                            assignment.setStatus(newStatus == RescueRequestStatus.COMPLETED ? AssignmentStatus.COMPLETED : AssignmentStatus.REJECTED);
                            if (newStatus == RescueRequestStatus.CANCELED) {
                                assignment.setRejectedAt(java.time.LocalDateTime.now());
                            }
                            requestAssignmentRepository.saveAndFlush(assignment);
                        }
                        if (assignment.getStaff() != null) {
                            boolean stillBusy = requestAssignmentRepository.existsByStaffIdAndStatusIn(
                                    assignment.getStaff().getId(),
                                    java.util.List.of(AssignmentStatus.PENDING, AssignmentStatus.ACCEPTED)
                            );
                            if (!stillBusy && assignment.getStaff().getStatus() == com.itss.vbas.enums.StaffStatus.BUSY) {
                                assignment.getStaff().setStatus(com.itss.vbas.enums.StaffStatus.ACTIVE);
                                rescueStaffRepository.save(assignment.getStaff());
                            }
                        }
                    });
        }

        return savedRequest;
    }
}
