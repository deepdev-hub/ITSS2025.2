package com.itss.vbas.service;

import java.time.LocalDate;

import com.itss.vbas.dto.dashboard.DashboardDto;

public interface DashboardService {
    DashboardDto.AdminDashboardResponse getAdminDashboard();

    DashboardDto.AdminDashboardResponse refreshAdminDashboard();

    DashboardDto.CompanyDashboardResponse getCompanyDashboard();

    DashboardDto.StaffDashboardResponse getStaffDashboard();

    DashboardDto.CompanyPerformanceResponse getCompanyPerformance(LocalDate startDate, LocalDate endDate);
}
