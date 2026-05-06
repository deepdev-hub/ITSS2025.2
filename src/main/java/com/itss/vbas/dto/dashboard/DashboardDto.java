package com.itss.vbas.dto.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public final class DashboardDto {

    private DashboardDto() {
    }

    public record AdminDashboardResponse(
            LocalDate statDate,
            LocalDateTime calculatedAt,
            long requestCount,
            long completedRequestCount,
            long canceledRequestCount,
            long inProgressRequestCount,
            long paidPaymentCount,
            BigDecimal revenue,
            long reviewCount,
            BigDecimal averageRating,
            long customerCount,
            long staffCount,
            long companyCount,
            long approvedCompanyCount,
            long totalAccounts,
            long totalCustomers,
            long totalCompanies,
            long totalRequests,
            long pendingRequests,
            long totalPayments,
            long paidPayments,
            long totalReviews
    ) {
    }

    public record CompanyDashboardResponse(
            Long companyId,
            long assignedRequests,
            long inProgressRequests,
            long totalStaff,
            long totalVehicles,
            long totalQuotes,
            long pendingQuotes,
            long totalReviews
    ) {
    }

    public record StaffDashboardResponse(
            Long staffId,
            long totalAssignments,
            long activeAssignments,
            long completedAssignments,
            long handlingRequests
    ) {
    }
}
