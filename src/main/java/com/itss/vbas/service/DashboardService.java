package com.itss.vbas.service;

import com.itss.vbas.dto.dashboard.DashboardDto;

public interface DashboardService {
    DashboardDto.AdminDashboardResponse getAdminDashboard();

    DashboardDto.AdminDashboardResponse refreshAdminDashboard();

    DashboardDto.CompanyDashboardResponse getCompanyDashboard();

    DashboardDto.StaffDashboardResponse getStaffDashboard();
}
