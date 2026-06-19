package com.itss.vbas.service;

import java.util.List;

import com.itss.vbas.dto.company.CompanyDto;
import com.itss.vbas.dto.request.RequestDto;

public interface CompanyService {
    CompanyDto.CompanyResponse getMyCompany();

    CompanyDto.CompanyResponse updateMyCompany(CompanyDto.CompanyRequest request);

    List<CompanyDto.StaffResponse> getStaff();

    CompanyDto.StaffResponse createStaff(CompanyDto.StaffRequest request);

    CompanyDto.StaffResponse updateStaff(Long id, CompanyDto.StaffRequest request);

    void deleteStaff(Long id);

    CompanyDto.StaffProfileResponse getStaffProfile(Long id);

    List<CompanyDto.VehicleResponse> getVehicles();

    CompanyDto.VehicleResponse createVehicle(CompanyDto.VehicleRequest request);

    CompanyDto.VehicleResponse updateVehicle(Long id, CompanyDto.VehicleRequest request);

    void deleteVehicle(Long id);

    List<RequestDto.RequestSummaryResponse> getCompanyRequests();

    RequestDto.AssignmentResponse assignStaffAndVehicle(Long requestId, RequestDto.AssignmentRequest request);

    List<RequestDto.AssignmentResponse> getMyStaffAssignments();

    void updateStaffLocation(CompanyDto.LocationUpdateRequest request);

    CompanyDto.StaffStatusResponse getMyStaffStatus();

    CompanyDto.StaffStatusResponse updateMyStaffStatus(CompanyDto.StaffStatusUpdateRequest request);

    List<RequestDto.NearbyRequestSummaryResponse> getNearbySearchingRequests();

    RequestDto.AssignmentResponse acceptNearbySearchingRequest(Long requestId);
}
