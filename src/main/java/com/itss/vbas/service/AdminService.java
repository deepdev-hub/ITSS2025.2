package com.itss.vbas.service;

import java.util.List;

import com.itss.vbas.dto.admin.AdminDto;
import com.itss.vbas.dto.common.CommonDto;
import com.itss.vbas.dto.company.CompanyDto;
import com.itss.vbas.dto.request.RequestDto;

public interface AdminService {
    //Quản lý tài khoản
    List<AdminDto.AccountResponse> getAccounts();
    AdminDto.AccountResponse getAccount(Long id);
    AdminDto.AccountResponse createAccount(AdminDto.AccountRequest request);
    AdminDto.AccountResponse updateAccount(Long id, AdminDto.AccountRequest request);
    void deleteAccount(Long id);

    AdminDto.AccountResponse blockAccount(Long id);

    AdminDto.AccountResponse unblockAccount(Long id);

    List<CommonDto.RoleResponse> getRoles();
    CommonDto.RoleResponse createRole(AdminDto.RoleRequest request);
    CommonDto.RoleResponse updateRole(Long id, AdminDto.RoleRequest request);
    void deleteRole(Long id);

    // Quản lý Loại sự cố và Dịch vụ
    List<AdminDto.IncidentTypeResponse> getIncidentTypes();
    AdminDto.IncidentTypeResponse createIncidentType(AdminDto.IncidentTypeRequest request);
    AdminDto.IncidentTypeResponse updateIncidentType(Long id, AdminDto.IncidentTypeRequest request);
    void deleteIncidentType(Long id);


    List<AdminDto.ServiceTypeResponse> getServiceTypes();
    AdminDto.ServiceTypeResponse createServiceType(AdminDto.ServiceTypeRequest request);
    AdminDto.ServiceTypeResponse updateServiceType(Long id, AdminDto.ServiceTypeRequest request);
    void deleteServiceType(Long id);

    //Quản lý công ty
    List<CompanyDto.CompanyResponse> getCompanies();
    CompanyDto.CompanyResponse getCompany(Long id);
    CompanyDto.CompanyResponse createCompany(CompanyDto.CompanyRequest request);
    CompanyDto.CompanyResponse updateCompany(Long id, CompanyDto.CompanyRequest request);
    void deleteCompany(Long id);

    List<CompanyDto.StaffResponse> getCompanyStaff(Long companyId);

    CompanyDto.StaffResponse createCompanyStaff(Long companyId, CompanyDto.StaffRequest request);

    CompanyDto.StaffResponse updateCompanyStaff(Long companyId, Long staffId, CompanyDto.StaffRequest request);

    void deleteCompanyStaff(Long companyId, Long staffId);

    List<RequestDto.RequestSummaryResponse> getAllRequests();

    RequestDto.AssignmentResponse assignStaff(Long requestId, AdminDto.AssignStaffRequest request);

    List<CompanyDto.StaffResponse> getActiveStaffLocations();
    
    RequestDto.AssignmentResponse autoAssignNearestStaff(Long requestId);
}
