package com.itss.vbas.mapper;

import java.util.List;

import com.itss.vbas.dto.admin.AdminDto;
import com.itss.vbas.dto.auth.AuthDto;
import com.itss.vbas.dto.common.CommonDto;
import com.itss.vbas.dto.company.CompanyDto;
import com.itss.vbas.dto.customer.CustomerDto;
import com.itss.vbas.dto.request.RequestDto;
import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.Address;
import com.itss.vbas.entity.CustomerVehicle;
import com.itss.vbas.entity.IncidentType;
import com.itss.vbas.entity.Message;
import com.itss.vbas.entity.Payment;
import com.itss.vbas.entity.Quote;
import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.entity.RequestStatusHistory;
import com.itss.vbas.entity.RescueCompany;
import com.itss.vbas.entity.RescueCompanyBranch;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.entity.RescueStaff;
import com.itss.vbas.entity.RescueVehicle;
import com.itss.vbas.entity.Review;
import com.itss.vbas.entity.ServiceType;
import org.springframework.stereotype.Component;

@Component
public class AppMapper {

    public CommonDto.AddressResponse toAddressResponse(Address address) {
        if (address == null) {
            return null;
        }
        return new CommonDto.AddressResponse(
                address.getId(),
                address.getCountry(),
                address.getProvince(),
                address.getDistrict(),
                address.getWard(),
                address.getStreet(),
                address.getDetail(),
                address.getLatitude(),
                address.getLongitude(),
                buildFullAddress(address)
        );
    }

    public CommonDto.AccountSummaryResponse toAccountSummary(Account account) {
        if (account == null) {
            return null;
        }
        return new CommonDto.AccountSummaryResponse(
                account.getId(),
                account.getEmail(),
                account.getFullName(),
                account.getPhone(),
                account.getAvatarUrl(),
                account.getStatus().name(),
                account.getRole().getRoleName().name(),
                account.getDateOfBirth(),
                account.getGender(),
                account.getCccd()
        );
    }

    public AuthDto.ProfileResponse toProfileResponse(Account account, Long companyId, Long staffId) {
        return new AuthDto.ProfileResponse(
                account.getId(),
                account.getEmail(),
                account.getFullName(),
                account.getPhone(),
                account.getAvatarUrl(),
                account.getStatus().name(),
                account.getRole().getRoleName().name(),
                account.getCreatedAt(),
                account.getDateOfBirth(),
                account.getGender(),
                account.getCccd(),
                toAddressResponse(account.getDefaultAddress()),
                companyId,
                staffId
        );
    }

    public AdminDto.AccountResponse toAdminAccountResponse(Account account) {
        return new AdminDto.AccountResponse(
                account.getId(),
                account.getEmail(),
                account.getFullName(),
                account.getPhone(),
                account.getAvatarUrl(),
                account.getStatus().name(),
                account.getRole().getRoleName().name(),
                account.getCreatedAt(),
                account.getDateOfBirth(),
                account.getGender(),
                account.getCccd(),
                toAddressResponse(account.getDefaultAddress())
        );
    }

    public CustomerDto.VehicleResponse toVehicleResponse(CustomerVehicle vehicle) {
        if (vehicle == null) {
            return null;
        }
        return new CustomerDto.VehicleResponse(
                vehicle.getId(),
                vehicle.getBrand(),
                vehicle.getModel(),
                vehicle.getPlateNumber(),
                vehicle.getManufactureYear(),
                vehicle.getColor(),
                vehicle.getFuelType(),
                vehicle.getNotes()
        );
    }

    public CommonDto.LookupResponse toLookupResponse(IncidentType incidentType) {
        if (incidentType == null) {
            return null;
        }
        return new CommonDto.LookupResponse(incidentType.getId(), incidentType.getIncidentCode(), incidentType.getIncidentName());
    }

    public CommonDto.LookupResponse toLookupResponse(ServiceType serviceType) {
        if (serviceType == null) {
            return null;
        }
        return new CommonDto.LookupResponse(serviceType.getId(), serviceType.getServiceCode(), serviceType.getServiceName());
    }

    public AdminDto.IncidentTypeResponse toIncidentTypeResponse(IncidentType incidentType) {
        return new AdminDto.IncidentTypeResponse(
                incidentType.getId(),
                incidentType.getIncidentCode(),
                incidentType.getIncidentName(),
                incidentType.getDescription()
        );
    }

    public AdminDto.ServiceTypeResponse toServiceTypeResponse(ServiceType serviceType) {
        return new AdminDto.ServiceTypeResponse(
                serviceType.getId(),
                serviceType.getServiceCode(),
                serviceType.getServiceName(),
                serviceType.getDescription()
        );
    }

    public CommonDto.BasicCompanyResponse toBasicCompanyResponse(RescueCompany company) {
        if (company == null) {
            return null;
        }
        return new CommonDto.BasicCompanyResponse(
                company.getId(),
                company.getCompanyName(),
                company.getStatus().name(),
                company.getPhone(),
                company.getEmail()
        );
    }

    public CompanyDto.CompanyResponse toCompanyResponse(RescueCompany company) {
        return new CompanyDto.CompanyResponse(
                company.getId(),
                company.getCompanyName(),
                company.getTaxCode(),
                company.getLicenseNumber(),
                company.getEmail(),
                company.getPhone(),
                company.getDescription(),
                company.getStatus().name(),
                company.getCreatedAt(),
                company.getUpdatedAt(),
                toAccountSummary(company.getOwnerAccount())
        );
    }

    public CompanyDto.BranchResponse toBranchResponse(RescueCompanyBranch branch) {
        return new CompanyDto.BranchResponse(
                branch.getId(),
                branch.getCompany().getId(),
                branch.getBranchName(),
                branch.getPhone(),
                toAddressResponse(branch.getAddress()),
                branch.getLatitude(),
                branch.getLongitude(),
                branch.getIsMainBranch()
        );
    }

    public CompanyDto.StaffResponse toStaffResponse(RescueStaff staff) {
        return new CompanyDto.StaffResponse(
                staff.getId(),
                staff.getUser().getId(),
                staff.getCompany().getId(),
                staff.getBranch() == null ? null : staff.getBranch().getId(),
                staff.getUser().getFullName(),
                staff.getUser().getEmail(),
                staff.getUser().getPhone(),
                staff.getJobTitle(),
                staff.getStatus().name()
        );
    }

    public CompanyDto.VehicleResponse toRescueVehicleResponse(RescueVehicle rescueVehicle) {
        return new CompanyDto.VehicleResponse(
                rescueVehicle.getId(),
                rescueVehicle.getBranch().getId(),
                rescueVehicle.getBranch().getBranchName(),
                rescueVehicle.getVehicleCode(),
                rescueVehicle.getVehicleType(),
                rescueVehicle.getPlateNumber(),
                rescueVehicle.getStatus().name()
        );
    }

    public RequestDto.AssignmentResponse toAssignmentResponse(RequestAssignment assignment) {
        if (assignment == null) {
            return null;
        }
        return new RequestDto.AssignmentResponse(
                assignment.getId(),
                assignment.getRequest().getId(),
                assignment.getCompany().getId(),
                assignment.getCompany().getCompanyName(),
                assignment.getStaff() == null ? null : assignment.getStaff().getId(),
                assignment.getStaff() == null ? null : assignment.getStaff().getUser().getFullName(),
                assignment.getVehicle() == null ? null : assignment.getVehicle().getId(),
                assignment.getVehicle() == null ? null : assignment.getVehicle().getVehicleCode(),
                assignment.getVehicle() == null ? null : assignment.getVehicle().getPlateNumber(),
                assignment.getAssignedByUser().getId(),
                assignment.getAssignedByUser().getFullName(),
                assignment.getAssignedAt(),
                assignment.getAcceptedAt(),
                assignment.getRejectedAt(),
                assignment.getStatus().name()
        );
    }

    public RequestDto.StatusHistoryResponse toStatusHistoryResponse(RequestStatusHistory history) {
        return new RequestDto.StatusHistoryResponse(
                history.getId(),
                history.getOldStatus() == null ? null : history.getOldStatus().name(),
                history.getNewStatus().name(),
                history.getChangedByUser().getId(),
                history.getChangedByUser().getFullName(),
                history.getNote(),
                history.getChangedAt()
        );
    }

    public RequestDto.QuoteResponse toQuoteResponse(Quote quote) {
        return new RequestDto.QuoteResponse(
                quote.getId(),
                quote.getQuoteCode(),
                quote.getRequest().getId(),
                quote.getCompany().getId(),
                quote.getCompany().getCompanyName(),
                quote.getStaff() == null ? null : quote.getStaff().getId(),
                quote.getStaff() == null ? null : quote.getStaff().getUser().getFullName(),
                quote.getEstimatedAmount(),
                quote.getFinalAmount(),
                quote.getStatus().name(),
                quote.getCreatedAt(),
                quote.getExpiresAt(),
                quote.getServiceName(),
                quote.getQuantity(),
                quote.getUnitPrice(),
                quote.getSubtotal()
        );
    }

    public RequestDto.PaymentResponse toPaymentResponse(Payment payment) {
        return new RequestDto.PaymentResponse(
                payment.getId(),
                payment.getRequest().getId(),
                payment.getCustomer().getId(),
                payment.getAmount(),
                payment.getPaymentMethod().name(),
                payment.getPaymentStatus().name(),
                payment.getCreatedAt(),
                payment.getPaidAt()
        );
    }

    public RequestDto.MessageResponse toMessageResponse(Message message) {
        return new RequestDto.MessageResponse(
                message.getId(),
                message.getRequest().getId(),
                message.getSender().getId(),
                message.getSender().getFullName(),
                message.getSender().getRole().getRoleName().name(),
                message.getContent(),
                message.getSentAt()
        );
    }

    public RequestDto.ReviewResponse toReviewResponse(Review review) {
        if (review == null) {
            return null;
        }
        return new RequestDto.ReviewResponse(
                review.getId(),
                review.getRequest().getId(),
                review.getCustomer().getFullName(),
                review.getCompany().getCompanyName(),
                review.getStaff() == null ? null : review.getStaff().getUser().getFullName(),
                review.getRatingScore(),
                review.getComment(),
                review.getCreatedAt()
        );
    }

    public RequestDto.RequestSummaryResponse toRequestSummaryResponse(RescueRequest request, RescueCompany assignedCompany) {
        return new RequestDto.RequestSummaryResponse(
                request.getId(),
                request.getRequestCode(),
                request.getStatus().name(),
                request.getPriorityLevel().name(),
                request.getDescription(),
                request.getIncidentType().getIncidentName(),
                request.getServiceType() == null ? null : request.getServiceType().getServiceName(),
                request.getLocation() == null ? null : buildFullAddress(request.getLocation()),
                request.getVehicle() == null ? null : request.getVehicle().getBrand() + " " + request.getVehicle().getModel() + " - " + request.getVehicle().getPlateNumber(),
                request.getCustomer().getFullName(),
                request.getCreatedAt(),
                request.getUpdatedAt(),
                toBasicCompanyResponse(assignedCompany)
        );
    }

    public RequestDto.RequestDetailResponse toRequestDetailResponse(
            RescueRequest request,
            RescueCompany assignedCompany,
            RequestAssignment currentAssignment,
            List<RequestDto.StatusHistoryResponse> history,
            List<RequestDto.QuoteResponse> quotes,
            List<RequestDto.PaymentResponse> payments,
            RequestDto.ReviewResponse review
    ) {
        return new RequestDto.RequestDetailResponse(
                request.getId(),
                request.getRequestCode(),
                request.getStatus().name(),
                request.getPriorityLevel().name(),
                request.getDescription(),
                request.getCreatedAt(),
                request.getUpdatedAt(),
                toAccountSummary(request.getCustomer()),
                toVehicleResponse(request.getVehicle()),
                toLookupResponse(request.getIncidentType()),
                toLookupResponse(request.getServiceType()),
                toAddressResponse(request.getLocation()),
                toBasicCompanyResponse(assignedCompany),
                toAssignmentResponse(currentAssignment),
                history,
                quotes,
                payments,
                review
        );
    }

    private String buildFullAddress(Address address) {
        return List.of(address.getDetail(), address.getStreet(), address.getWard(), address.getDistrict(), address.getProvince(), address.getCountry())
                .stream()
                .filter(value -> value != null && !value.isBlank())
                .reduce((left, right) -> left + ", " + right)
                .orElse("");
    }
}
