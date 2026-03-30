package com.itss.vbas.dto.dashboard;

public final class DashboardDto {

    private DashboardDto() {
    }

    public record AdminDashboardResponse(
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
