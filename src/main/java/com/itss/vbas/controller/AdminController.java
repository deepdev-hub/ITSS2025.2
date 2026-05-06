package com.itss.vbas.controller;

import java.util.List;

import com.itss.vbas.dto.admin.AdminDto;
import com.itss.vbas.dto.common.CommonDto;
import com.itss.vbas.dto.company.CompanyDto;
import com.itss.vbas.dto.dashboard.DashboardDto;
import com.itss.vbas.dto.request.RequestDto;
import com.itss.vbas.enums.RoleName;
import com.itss.vbas.security.RequiredRoles;
import com.itss.vbas.service.AdminService;
import com.itss.vbas.service.DashboardService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredRoles(RoleName.ADMIN)
public class AdminController {

    private final AdminService adminService;
    private final DashboardService dashboardService;

    public AdminController(AdminService adminService, DashboardService dashboardService) {
        this.adminService = adminService;
        this.dashboardService = dashboardService;
    }

    @GetMapping("/accounts")
    public ResponseEntity<CommonDto.ApiResponse<List<AdminDto.AccountResponse>>> getAccounts() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Accounts fetched successfully", adminService.getAccounts()));
    }

    @PostMapping("/accounts")
    public ResponseEntity<CommonDto.ApiResponse<AdminDto.AccountResponse>> createAccount(@Valid @RequestBody AdminDto.AccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonDto.ApiResponse.success("Account created successfully", adminService.createAccount(request)));
    }

    @GetMapping("/accounts/{id}")
    public ResponseEntity<CommonDto.ApiResponse<AdminDto.AccountResponse>> getAccount(@PathVariable Long id) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Account fetched successfully", adminService.getAccount(id)));
    }

    @PutMapping("/accounts/{id}")
    public ResponseEntity<CommonDto.ApiResponse<AdminDto.AccountResponse>> updateAccount(
            @PathVariable Long id,
            @Valid @RequestBody AdminDto.AccountRequest request
    ) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Account updated successfully", adminService.updateAccount(id, request)));
    }

    @DeleteMapping("/accounts/{id}")
    public ResponseEntity<CommonDto.ApiResponse<Void>> deleteAccount(@PathVariable Long id) {
        adminService.deleteAccount(id);
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Account deactivated successfully"));
    }

    @PutMapping("/accounts/{id}/block")
    public ResponseEntity<CommonDto.ApiResponse<AdminDto.AccountResponse>> blockAccount(@PathVariable Long id) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Account blocked successfully", adminService.blockAccount(id)));
    }

    @PutMapping("/accounts/{id}/unblock")
    public ResponseEntity<CommonDto.ApiResponse<AdminDto.AccountResponse>> unblockAccount(@PathVariable Long id) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Account unblocked successfully", adminService.unblockAccount(id)));
    }

    @GetMapping("/roles")
    public ResponseEntity<CommonDto.ApiResponse<List<CommonDto.RoleResponse>>> getRoles() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Roles fetched successfully", adminService.getRoles()));
    }

    @PostMapping("/roles")
    public ResponseEntity<CommonDto.ApiResponse<CommonDto.RoleResponse>> createRole(@Valid @RequestBody AdminDto.RoleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonDto.ApiResponse.success("Role created successfully", adminService.createRole(request)));
    }

    @PutMapping("/roles/{id}")
    public ResponseEntity<CommonDto.ApiResponse<CommonDto.RoleResponse>> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody AdminDto.RoleRequest request
    ) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Role updated successfully", adminService.updateRole(id, request)));
    }

    @DeleteMapping("/roles/{id}")
    public ResponseEntity<CommonDto.ApiResponse<Void>> deleteRole(@PathVariable Long id) {
        adminService.deleteRole(id);
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Role deleted successfully"));
    }

    @GetMapping("/incident-types")
    public ResponseEntity<CommonDto.ApiResponse<List<AdminDto.IncidentTypeResponse>>> getIncidentTypes() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Incident types fetched successfully", adminService.getIncidentTypes()));
    }

    @PostMapping("/incident-types")
    public ResponseEntity<CommonDto.ApiResponse<AdminDto.IncidentTypeResponse>> createIncidentType(@Valid @RequestBody AdminDto.IncidentTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonDto.ApiResponse.success("Incident type created successfully", adminService.createIncidentType(request)));
    }

    @PutMapping("/incident-types/{id}")
    public ResponseEntity<CommonDto.ApiResponse<AdminDto.IncidentTypeResponse>> updateIncidentType(
            @PathVariable Long id,
            @Valid @RequestBody AdminDto.IncidentTypeRequest request
    ) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Incident type updated successfully", adminService.updateIncidentType(id, request)));
    }

    @DeleteMapping("/incident-types/{id}")
    public ResponseEntity<CommonDto.ApiResponse<Void>> deleteIncidentType(@PathVariable Long id) {
        adminService.deleteIncidentType(id);
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Incident type deleted successfully"));
    }

    @GetMapping("/service-types")
    public ResponseEntity<CommonDto.ApiResponse<List<AdminDto.ServiceTypeResponse>>> getServiceTypes() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Service types fetched successfully", adminService.getServiceTypes()));
    }

    @PostMapping("/service-types")
    public ResponseEntity<CommonDto.ApiResponse<AdminDto.ServiceTypeResponse>> createServiceType(@Valid @RequestBody AdminDto.ServiceTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonDto.ApiResponse.success("Service type created successfully", adminService.createServiceType(request)));
    }

    @PutMapping("/service-types/{id}")
    public ResponseEntity<CommonDto.ApiResponse<AdminDto.ServiceTypeResponse>> updateServiceType(
            @PathVariable Long id,
            @Valid @RequestBody AdminDto.ServiceTypeRequest request
    ) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Service type updated successfully", adminService.updateServiceType(id, request)));
    }

    @DeleteMapping("/service-types/{id}")
    public ResponseEntity<CommonDto.ApiResponse<Void>> deleteServiceType(@PathVariable Long id) {
        adminService.deleteServiceType(id);
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Service type deleted successfully"));
    }

    @GetMapping("/companies")
    public ResponseEntity<CommonDto.ApiResponse<List<CompanyDto.CompanyResponse>>> getCompanies() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Companies fetched successfully", adminService.getCompanies()));
    }

    @PostMapping("/companies")
    public ResponseEntity<CommonDto.ApiResponse<CompanyDto.CompanyResponse>> createCompany(@Valid @RequestBody CompanyDto.CompanyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonDto.ApiResponse.success("Company created successfully", adminService.createCompany(request)));
    }

    @GetMapping("/companies/{id}")
    public ResponseEntity<CommonDto.ApiResponse<CompanyDto.CompanyResponse>> getCompany(@PathVariable Long id) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Company fetched successfully", adminService.getCompany(id)));
    }

    @PutMapping("/companies/{id}")
    public ResponseEntity<CommonDto.ApiResponse<CompanyDto.CompanyResponse>> updateCompany(
            @PathVariable Long id,
            @Valid @RequestBody CompanyDto.CompanyRequest request
    ) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Company updated successfully", adminService.updateCompany(id, request)));
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<CommonDto.ApiResponse<Void>> deleteCompany(@PathVariable Long id) {
        adminService.deleteCompany(id);
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Company suspended successfully"));
    }

    @GetMapping("/companies/{companyId}/branches")
    public ResponseEntity<CommonDto.ApiResponse<List<CompanyDto.BranchResponse>>> getCompanyBranches(@PathVariable Long companyId) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Company branches fetched successfully", adminService.getCompanyBranches(companyId)));
    }

    @GetMapping("/companies/{companyId}/staff")
    public ResponseEntity<CommonDto.ApiResponse<List<CompanyDto.StaffResponse>>> getCompanyStaff(@PathVariable Long companyId) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Company staff fetched successfully", adminService.getCompanyStaff(companyId)));
    }

    @PostMapping("/companies/{companyId}/staff")
    public ResponseEntity<CommonDto.ApiResponse<CompanyDto.StaffResponse>> createCompanyStaff(
            @PathVariable Long companyId,
            @Valid @RequestBody CompanyDto.StaffRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonDto.ApiResponse.success("Company staff created successfully", adminService.createCompanyStaff(companyId, request)));
    }

    @PutMapping("/companies/{companyId}/staff/{staffId}")
    public ResponseEntity<CommonDto.ApiResponse<CompanyDto.StaffResponse>> updateCompanyStaff(
            @PathVariable Long companyId,
            @PathVariable Long staffId,
            @Valid @RequestBody CompanyDto.StaffRequest request
    ) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Company staff updated successfully", adminService.updateCompanyStaff(companyId, staffId, request)));
    }

    @DeleteMapping("/companies/{companyId}/staff/{staffId}")
    public ResponseEntity<CommonDto.ApiResponse<Void>> deleteCompanyStaff(
            @PathVariable Long companyId,
            @PathVariable Long staffId
    ) {
        adminService.deleteCompanyStaff(companyId, staffId);
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Company staff deleted successfully"));
    }

    @GetMapping("/requests")
    public ResponseEntity<CommonDto.ApiResponse<List<RequestDto.RequestSummaryResponse>>> getRequests() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Requests fetched successfully", adminService.getAllRequests()));
    }

    @PutMapping("/requests/{id}/assign-company")
    public ResponseEntity<CommonDto.ApiResponse<RequestDto.AssignmentResponse>> assignCompany(
            @PathVariable Long id,
            @Valid @RequestBody AdminDto.AssignCompanyRequest request
    ) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Company assigned successfully", adminService.assignCompany(id, request)));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<CommonDto.ApiResponse<DashboardDto.AdminDashboardResponse>> getDashboard() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Admin dashboard fetched successfully", dashboardService.getAdminDashboard()));
    }
}
