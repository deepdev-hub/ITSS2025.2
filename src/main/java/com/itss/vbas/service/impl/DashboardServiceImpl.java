package com.itss.vbas.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import com.itss.vbas.dto.dashboard.DashboardDto;
import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.DailyStatistic;
import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.entity.RescueCompany;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.entity.RescueStaff;
import com.itss.vbas.enums.AssignmentStatus;
import com.itss.vbas.enums.CompanyStatus;
import com.itss.vbas.enums.PaymentStatus;
import com.itss.vbas.enums.QuoteStatus;
import com.itss.vbas.enums.RescueRequestStatus;
import com.itss.vbas.enums.RoleName;
import com.itss.vbas.exception.BadRequestException;
import com.itss.vbas.repository.AccountRepository;
import com.itss.vbas.repository.DailyStatisticRepository;
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
    private final DailyStatisticRepository dailyStatisticRepository;
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
            DailyStatisticRepository dailyStatisticRepository,
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
        this.dailyStatisticRepository = dailyStatisticRepository;
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
        DailyStatistic statistics = dailyStatisticRepository.findTopByOrderByStatDateDesc()
                .orElseGet(this::buildCurrentStatisticsSnapshot);
        return toAdminDashboardResponse(statistics);
    }

    @Override
    @Transactional
    public DashboardDto.AdminDashboardResponse refreshAdminDashboard() {
        LocalDate today = LocalDate.now();
        DailyStatistic snapshot = buildCurrentStatisticsSnapshot();
        DailyStatistic statistics = dailyStatisticRepository.findByStatDate(today)
                .orElseGet(() -> DailyStatistic.builder().statDate(today).build());

        statistics.setRequestCount(snapshot.getRequestCount());
        statistics.setCompletedRequestCount(snapshot.getCompletedRequestCount());
        statistics.setCanceledRequestCount(snapshot.getCanceledRequestCount());
        statistics.setInProgressRequestCount(snapshot.getInProgressRequestCount());
        statistics.setPaidPaymentCount(snapshot.getPaidPaymentCount());
        statistics.setRevenue(snapshot.getRevenue());
        statistics.setReviewCount(snapshot.getReviewCount());
        statistics.setAverageRating(snapshot.getAverageRating());
        statistics.setCustomerCount(snapshot.getCustomerCount());
        statistics.setStaffCount(snapshot.getStaffCount());
        statistics.setCompanyCount(snapshot.getCompanyCount());
        statistics.setApprovedCompanyCount(snapshot.getApprovedCompanyCount());
        statistics.setCalculatedAt(snapshot.getCalculatedAt());

        return toAdminDashboardResponse(dailyStatisticRepository.save(statistics));
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
                rescueVehicleRepository.countByCompanyId(company.getId()),
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

    @Override
    public DashboardDto.CompanyPerformanceResponse getCompanyPerformance(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new BadRequestException("startDate must be before or equal to endDate");
        }

        LocalDateTime startAt = startDate == null ? LocalDate.of(1970, 1, 1).atStartOfDay() : startDate.atStartOfDay();
        LocalDateTime endAt = endDate == null ? LocalDate.of(3000, 1, 1).atStartOfDay() : endDate.plusDays(1).atStartOfDay();

        List<DashboardDto.CompanyMetricResponse> companies = rescueCompanyRepository.findAll()
                .stream()
                .map(company -> {
                    BigDecimal revenue = defaultMoney(paymentRepository.sumPaidRevenueByCompanyId(
                            company.getId(),
                            PaymentStatus.PAID,
                            startAt,
                            endAt
                    ));
                    Double averageRatingValue = reviewRepository.findAverageRatingByCompanyId(company.getId(), startAt, endAt);
                    return new DashboardDto.CompanyMetricResponse(
                            company.getId(),
                            company.getCompanyName(),
                            revenue,
                            toRating(averageRatingValue),
                            reviewRepository.countReviewsByCompanyId(company.getId(), startAt, endAt),
                            paymentRepository.countPaidPaymentsByCompanyId(company.getId(), PaymentStatus.PAID, startAt, endAt),
                            requestAssignmentRepository.countDistinctRequestsByCompanyIdAndRequestStatus(
                                    company.getId(),
                                    RescueRequestStatus.COMPLETED,
                                    startAt,
                                    endAt
                            )
                    );
                })
                .sorted(Comparator.comparing(DashboardDto.CompanyMetricResponse::revenue).reversed())
                .toList();

        return new DashboardDto.CompanyPerformanceResponse(startDate, endDate, companies);
    }

    private DashboardDto.AdminDashboardResponse toAdminDashboardResponse(DailyStatistic statistics) {
        long totalAccounts = accountRepository.count();
        long totalCustomers = accountRepository.countByRoleRoleName(RoleName.CUSTOMER);
        long totalCompanies = rescueCompanyRepository.count();
        long totalRequests = rescueRequestRepository.count();
        long totalPayments = paymentRepository.count();
        long totalReviews = reviewRepository.count();
        long pendingRequests = rescueRequestRepository.countByStatus(RescueRequestStatus.CREATED)
                + rescueRequestRepository.countByStatus(RescueRequestStatus.SEARCHING)
                + rescueRequestRepository.countByStatus(RescueRequestStatus.MATCHED);

        return new DashboardDto.AdminDashboardResponse(
                statistics.getStatDate(),
                statistics.getCalculatedAt(),
                defaultLong(statistics.getRequestCount()),
                defaultLong(statistics.getCompletedRequestCount()),
                defaultLong(statistics.getCanceledRequestCount()),
                defaultLong(statistics.getInProgressRequestCount()),
                defaultLong(statistics.getPaidPaymentCount()),
                defaultMoney(statistics.getRevenue()),
                defaultLong(statistics.getReviewCount()),
                statistics.getAverageRating(),
                defaultLong(statistics.getCustomerCount()),
                defaultLong(statistics.getStaffCount()),
                defaultLong(statistics.getCompanyCount()),
                defaultLong(statistics.getApprovedCompanyCount()),
                totalAccounts,
                totalCustomers,
                totalCompanies,
                totalRequests,
                pendingRequests,
                totalPayments,
                paymentRepository.countByPaymentStatus(PaymentStatus.PAID),
                totalReviews
        );
    }

    private DailyStatistic buildCurrentStatisticsSnapshot() {
        Double averageRatingValue = reviewRepository.findAverageRating();

        return DailyStatistic.builder()
                .statDate(LocalDate.now())
                .requestCount(rescueRequestRepository.count())
                .completedRequestCount(rescueRequestRepository.countByStatus(RescueRequestStatus.COMPLETED))
                .canceledRequestCount(rescueRequestRepository.countByStatus(RescueRequestStatus.CANCELED))
                .inProgressRequestCount(rescueRequestRepository.countByStatus(RescueRequestStatus.IN_PROGRESS))
                .paidPaymentCount(paymentRepository.countByPaymentStatus(PaymentStatus.PAID))
                .revenue(defaultMoney(paymentRepository.sumAmountByPaymentStatus(PaymentStatus.PAID)))
                .reviewCount(reviewRepository.count())
                .averageRating(averageRatingValue == null
                        ? null
                        : BigDecimal.valueOf(averageRatingValue).setScale(2, RoundingMode.HALF_UP))
                .customerCount(accountRepository.countByRoleRoleName(RoleName.CUSTOMER))
                .staffCount(rescueStaffRepository.count())
                .companyCount(rescueCompanyRepository.count())
                .approvedCompanyCount(rescueCompanyRepository.countByStatus(CompanyStatus.APPROVED))
                .calculatedAt(LocalDateTime.now())
                .build();
    }

    private long defaultLong(Long value) {
        return value == null ? 0L : value;
    }

    private BigDecimal defaultMoney(BigDecimal value) {
        return value == null ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP) : value.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal toRating(Double value) {
        return value == null ? null : BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }
}
