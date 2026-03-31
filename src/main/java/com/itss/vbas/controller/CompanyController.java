package com.itss.vbas.controller;

import java.util.List;

import com.itss.vbas.dto.common.CommonDto;
import com.itss.vbas.dto.company.CompanyDto;
import com.itss.vbas.dto.dashboard.DashboardDto;
import com.itss.vbas.dto.request.RequestDto;
import com.itss.vbas.enums.RoleName;
import com.itss.vbas.security.RequiredRoles;
import com.itss.vbas.service.CompanyService;
import com.itss.vbas.service.DashboardService;
import com.itss.vbas.service.QuoteService;
import com.itss.vbas.service.RescueRequestService;
import com.itss.vbas.service.ReviewService;
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
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;
    private final RescueRequestService rescueRequestService;
    private final QuoteService quoteService;
    private final ReviewService reviewService;
    private final DashboardService dashboardService;

    public CompanyController(
            CompanyService companyService,
            RescueRequestService rescueRequestService,
            QuoteService quoteService,
            ReviewService reviewService,
            DashboardService dashboardService
    ) {
        this.companyService = companyService;
        this.rescueRequestService = rescueRequestService;
        this.quoteService = quoteService;
        this.reviewService = reviewService;
        this.dashboardService = dashboardService;
    }

    @RequiredRoles(RoleName.RESCUE_COMPANY)
    @GetMapping("/me")
    public ResponseEntity<CommonDto.ApiResponse<CompanyDto.CompanyResponse>> getMyCompany() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Company profile fetched successfully", companyService.getMyCompany()));
    }

    @RequiredRoles(RoleName.RESCUE_COMPANY)
    @PutMapping("/me")
    public ResponseEntity<CommonDto.ApiResponse<CompanyDto.CompanyResponse>> updateMyCompany(@Valid @RequestBody CompanyDto.CompanyRequest request) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Company profile updated successfully", companyService.updateMyCompany(request)));
    }

    @RequiredRoles(RoleName.RESCUE_COMPANY)
    @GetMapping("/requests")
    public ResponseEntity<CommonDto.ApiResponse<List<RequestDto.RequestSummaryResponse>>> getCompanyRequests() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Company requests fetched successfully", companyService.getCompanyRequests()));
    }

    @RequiredRoles({RoleName.RESCUE_COMPANY, RoleName.RESCUE_STAFF})
    @GetMapping("/requests/{id}")
    public ResponseEntity<CommonDto.ApiResponse<RequestDto.RequestDetailResponse>> getCompanyRequestDetail(@PathVariable Long id) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Request detail fetched successfully", rescueRequestService.getRequestDetail(id)));
    }

    @RequiredRoles(RoleName.RESCUE_COMPANY)
    @PostMapping("/requests/{id}/assignments")
    public ResponseEntity<CommonDto.ApiResponse<RequestDto.AssignmentResponse>> assignStaffAndVehicle(
            @PathVariable Long id,
            @Valid @RequestBody RequestDto.AssignmentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonDto.ApiResponse.success("Assignment updated successfully", companyService.assignStaffAndVehicle(id, request)));
    }

    @RequiredRoles(RoleName.RESCUE_COMPANY)
    @PostMapping("/requests/{id}/quotes")
    public ResponseEntity<CommonDto.ApiResponse<RequestDto.QuoteResponse>> createOrUpdateQuote(
            @PathVariable Long id,
            @Valid @RequestBody CompanyDto.QuoteRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonDto.ApiResponse.success("Quote saved successfully", quoteService.createOrUpdateQuote(id, request)));
    }

    @RequiredRoles(RoleName.RESCUE_COMPANY)
    @PutMapping("/quotes/{quoteId}/send")
    public ResponseEntity<CommonDto.ApiResponse<RequestDto.QuoteResponse>> sendQuote(@PathVariable Long quoteId) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Quote sent successfully", quoteService.sendQuote(quoteId)));
    }

    @RequiredRoles(RoleName.RESCUE_COMPANY)
    @GetMapping("/branches")
    public ResponseEntity<CommonDto.ApiResponse<List<CompanyDto.BranchResponse>>> getBranches() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Branches fetched successfully", companyService.getBranches()));
    }

    @RequiredRoles(RoleName.RESCUE_COMPANY)
    @PostMapping("/branches")
    public ResponseEntity<CommonDto.ApiResponse<CompanyDto.BranchResponse>> createBranch(@Valid @RequestBody CompanyDto.BranchRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonDto.ApiResponse.success("Branch created successfully", companyService.createBranch(request)));
    }

    @RequiredRoles(RoleName.RESCUE_COMPANY)
    @GetMapping("/branches/{id}")
    public ResponseEntity<CommonDto.ApiResponse<CompanyDto.BranchResponse>> getBranch(@PathVariable Long id) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Branch fetched successfully", companyService.getBranch(id)));
    }

    @RequiredRoles(RoleName.RESCUE_COMPANY)
    @PutMapping("/branches/{id}")
    public ResponseEntity<CommonDto.ApiResponse<CompanyDto.BranchResponse>> updateBranch(
            @PathVariable Long id,
            @Valid @RequestBody CompanyDto.BranchRequest request
    ) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Branch updated successfully", companyService.updateBranch(id, request)));
    }

    @RequiredRoles(RoleName.RESCUE_COMPANY)
    @DeleteMapping("/branches/{id}")
    public ResponseEntity<CommonDto.ApiResponse<Void>> deleteBranch(@PathVariable Long id) {
        companyService.deleteBranch(id);
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Branch deleted successfully"));
    }

    @RequiredRoles(RoleName.RESCUE_COMPANY)
    @GetMapping("/staff")
    public ResponseEntity<CommonDto.ApiResponse<List<CompanyDto.StaffResponse>>> getStaff() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Staff fetched successfully", companyService.getStaff()));
    }

    @RequiredRoles(RoleName.RESCUE_COMPANY)
    @PostMapping("/staff")
    public ResponseEntity<CommonDto.ApiResponse<CompanyDto.StaffResponse>> createStaff(@Valid @RequestBody CompanyDto.StaffRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonDto.ApiResponse.success("Staff created successfully", companyService.createStaff(request)));
    }

    @RequiredRoles(RoleName.RESCUE_COMPANY)
    @PutMapping("/staff/{id}")
    public ResponseEntity<CommonDto.ApiResponse<CompanyDto.StaffResponse>> updateStaff(
            @PathVariable Long id,
            @Valid @RequestBody CompanyDto.StaffRequest request
    ) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Staff updated successfully", companyService.updateStaff(id, request)));
    }

    @RequiredRoles(RoleName.RESCUE_COMPANY)
    @DeleteMapping("/staff/{id}")
    public ResponseEntity<CommonDto.ApiResponse<Void>> deleteStaff(@PathVariable Long id) {
        companyService.deleteStaff(id);
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Staff deleted successfully"));
    }

    @RequiredRoles(RoleName.RESCUE_COMPANY)
    @GetMapping("/vehicles")
    public ResponseEntity<CommonDto.ApiResponse<List<CompanyDto.VehicleResponse>>> getVehicles() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Rescue vehicles fetched successfully", companyService.getVehicles()));
    }

    @RequiredRoles(RoleName.RESCUE_COMPANY)
    @PostMapping("/vehicles")
    public ResponseEntity<CommonDto.ApiResponse<CompanyDto.VehicleResponse>> createVehicle(@Valid @RequestBody CompanyDto.VehicleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonDto.ApiResponse.success("Rescue vehicle created successfully", companyService.createVehicle(request)));
    }

    @RequiredRoles(RoleName.RESCUE_COMPANY)
    @PutMapping("/vehicles/{id}")
    public ResponseEntity<CommonDto.ApiResponse<CompanyDto.VehicleResponse>> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody CompanyDto.VehicleRequest request
    ) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Rescue vehicle updated successfully", companyService.updateVehicle(id, request)));
    }

    @RequiredRoles(RoleName.RESCUE_COMPANY)
    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<CommonDto.ApiResponse<Void>> deleteVehicle(@PathVariable Long id) {
        companyService.deleteVehicle(id);
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Rescue vehicle deleted successfully"));
    }

    @RequiredRoles(RoleName.RESCUE_COMPANY)
    @GetMapping("/reviews")
    public ResponseEntity<CommonDto.ApiResponse<List<RequestDto.ReviewResponse>>> getReviews() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Company reviews fetched successfully", reviewService.getCurrentCompanyReviews()));
    }

    @RequiredRoles(RoleName.RESCUE_COMPANY)
    @GetMapping("/dashboard")
    public ResponseEntity<CommonDto.ApiResponse<DashboardDto.CompanyDashboardResponse>> getCompanyDashboard() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Company dashboard fetched successfully", dashboardService.getCompanyDashboard()));
    }

    @RequiredRoles(RoleName.RESCUE_STAFF)
    @GetMapping("/staff/me/dashboard")
    public ResponseEntity<CommonDto.ApiResponse<DashboardDto.StaffDashboardResponse>> getStaffDashboard() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Staff dashboard fetched successfully", dashboardService.getStaffDashboard()));
    }

    @RequiredRoles(RoleName.RESCUE_STAFF)
    @GetMapping("/staff/me/assignments")
    public ResponseEntity<CommonDto.ApiResponse<List<RequestDto.AssignmentResponse>>> getMyAssignments() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("My assignments fetched successfully", companyService.getMyStaffAssignments()));
    }
}
