package com.itss.vbas.service.impl;

import java.util.List;

import com.itss.vbas.dto.dashboard.DashboardDto;
import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.entity.RescueCompany;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.entity.RescueStaff;
import com.itss.vbas.enums.AssignmentStatus;
import com.itss.vbas.enums.PaymentStatus;
import com.itss.vbas.enums.QuoteStatus;
import com.itss.vbas.enums.RescueRequestStatus;
import com.itss.vbas.enums.RoleName;
import com.itss.vbas.repository.AccountRepository;
import com.itss.vbas.repository.PaymentRepository;
import com.itss.vbas.repository.QuoteRepository;
import com.itss.vbas.repository.RequestAssignmentRepository;
import com.itss.vbas.repository.RescueCompanyRepository;
import com.itss.vbas.repository.RescueRequestRepository;
import com.itss.vbas.repository.RescueStaffRepository;
import com.itss.vbas.repository.RescueVehicleRepository;
import com.itss.vbas.repository.ReviewRepository;
import com.itss.vbas.security.AuthContext;
import com.itss.vbas.service.DashboardService;
import com.itss.vbas.service.RequestSupportService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final AccountRepository accountRepository;
    private final RescueCompanyRepository rescueCompanyRepository;
    private final RescueRequestRepository rescueRequestRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;
    private final RequestAssignmentRepository requestAssignmentRepository;
    private final RescueStaffRepository rescueStaffRepository;
    private final RescueVehicleRepository rescueVehicleRepository;
    private final QuoteRepository quoteRepository;
    private final RequestSupportService requestSupportService;
    private final AuthContext authContext;

    public DashboardServiceImpl(
            AccountRepository accountRepository,
            RescueCompanyRepository rescueCompanyRepository,
            RescueRequestRepository rescueRequestRepository,
            PaymentRepository paymentRepository,
            ReviewRepository reviewRepository,
            RequestAssignmentRepository requestAssignmentRepository,
            RescueStaffRepository rescueStaffRepository,
            RescueVehicleRepository rescueVehicleRepository,
            QuoteRepository quoteRepository,
            RequestSupportService requestSupportService,
            AuthContext authContext
    ) {
        this.accountRepository = accountRepository;
        this.rescueCompanyRepository = rescueCompanyRepository;
        this.rescueRequestRepository = rescueRequestRepository;
        this.paymentRepository = paymentRepository;
        this.reviewRepository = reviewRepository;
        this.requestAssignmentRepository = requestAssignmentRepository;
        this.rescueStaffRepository = rescueStaffRepository;
        this.rescueVehicleRepository = rescueVehicleRepository;
        this.quoteRepository = quoteRepository;
        this.requestSupportService = requestSupportService;
        this.authContext = authContext;
    }

    @Override
    public DashboardDto.AdminDashboardResponse getAdminDashboard() {
        long pendingRequests = rescueRequestRepository.countByStatus(RescueRequestStatus.CREATED)
                + rescueRequestRepository.countByStatus(RescueRequestStatus.SEARCHING)
                + rescueRequestRepository.countByStatus(RescueRequestStatus.MATCHED);

        return new DashboardDto.AdminDashboardResponse(
                accountRepository.count(),
                accountRepository.countByRoleRoleName(RoleName.CUSTOMER),
                rescueCompanyRepository.count(),
                rescueRequestRepository.count(),
                pendingRequests,
                paymentRepository.count(),
                paymentRepository.countByPaymentStatus(PaymentStatus.PAID),
                reviewRepository.count()
        );
    }

    @Override
    public DashboardDto.CompanyDashboardResponse getCompanyDashboard() {
        Account account = authContext.getCurrentAccount();
        RescueCompany company = requestSupportService.getCurrentCompany(account);
        List<RescueRequest> requests = rescueRequestRepository.findAssignedRequestsByCompanyId(company.getId());

        return new DashboardDto.CompanyDashboardResponse(
                company.getId(),
                requests.size(),
                requests.stream().filter(request -> request.getStatus() == RescueRequestStatus.IN_PROGRESS).count(),
                rescueStaffRepository.countByCompanyId(company.getId()),
                rescueVehicleRepository.countByBranchCompanyId(company.getId()),
                quoteRepository.countByCompanyId(company.getId()),
                quoteRepository.countByCompanyIdAndStatus(company.getId(), QuoteStatus.SENT),
                reviewRepository.countByCompanyId(company.getId())
        );
    }

    @Override
    public DashboardDto.StaffDashboardResponse getStaffDashboard() {
        Account account = authContext.getCurrentAccount();
        RescueStaff staff = requestSupportService.getCurrentStaff(account);
        List<RequestAssignment> assignments = requestAssignmentRepository.findByStaffIdOrderByAssignedAtDesc(staff.getId());

        return new DashboardDto.StaffDashboardResponse(
                staff.getId(),
                assignments.size(),
                assignments.stream().filter(assignment -> assignment.getStatus() == AssignmentStatus.ACCEPTED).count(),
                assignments.stream().filter(assignment -> assignment.getStatus() == AssignmentStatus.COMPLETED).count(),
                rescueRequestRepository.findAssignedRequestsByStaffId(staff.getId())
                        .stream()
                        .filter(request -> request.getStatus() == RescueRequestStatus.ACCEPTED || request.getStatus() == RescueRequestStatus.IN_PROGRESS)
                        .count()
        );
    }
}
