package com.itss.vbas.mapper;

import java.util.List;
import java.util.stream.Stream;

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
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.entity.RescueStaff;
import com.itss.vbas.entity.RescueVehicle;
import com.itss.vbas.entity.Review;
import com.itss.vbas.entity.ServiceType;
import com.itss.vbas.service.AssignmentTimeoutService;
import org.springframework.stereotype.Component;

@Component
public class AppMapper {

    private final AssignmentTimeoutService assignmentTimeoutService;

    public AppMapper(AssignmentTimeoutService assignmentTimeoutService) {
        this.assignmentTimeoutService = assignmentTimeoutService;
    }

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

    public CompanyDto.StaffResponse toStaffResponse(RescueStaff staff) {
        // 1. Lấy tọa độ an toàn
        java.math.BigDecimal lat = null;
        java.math.BigDecimal lng = null;
        
        if (staff.getUser() != null && staff.getUser().getDefaultAddress() != null) {
            lat = staff.getUser().getDefaultAddress().getLatitude();
            lng = staff.getUser().getDefaultAddress().getLongitude();
        }

        // 2. Trả về đúng 11 tham số theo định nghĩa
        return new CompanyDto.StaffResponse(
                staff.getId(),
                staff.getUser() != null ? staff.getUser().getId() : null,
                staff.getCompany() != null ? staff.getCompany().getId() : null,
                staff.getUser() != null ? staff.getUser().getFullName() : null,
                staff.getUser() != null ? staff.getUser().getEmail() : null,
                staff.getUser() != null ? staff.getUser().getPhone() : null,
                staff.getJobTitle(),
                staff.getStatus() != null ? staff.getStatus().name() : null,
                lat, // Bạn bị thiếu trường này
                lng  // Bạn bị thiếu trường này
        );
    }

    public CompanyDto.VehicleResponse toRescueVehicleResponse(RescueVehicle rescueVehicle) {
        return new CompanyDto.VehicleResponse(
                rescueVehicle.getId(),
                rescueVehicle.getCompany().getId(),
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
                assignment.getStatus().name(),
                assignmentTimeoutService.getTimeoutSeconds(assignment),
                assignmentTimeoutService.getExpiresAt(assignment)
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

    public RequestDto.RequestSummaryResponse toRequestSummaryResponse(
            RescueRequest request,
            RescueCompany assignedCompany,
            RequestAssignment currentAssignment
    ) {
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
                request.getImageUrl(),
                request.getCustomer().getFullName(),
                request.getCreatedAt(),
                request.getUpdatedAt(),
                toBasicCompanyResponse(assignedCompany),
                currentAssignment == null ? null : assignmentTimeoutService.getTimeoutSeconds(currentAssignment),
                currentAssignment == null ? null : assignmentTimeoutService.getExpiresAt(currentAssignment)
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
                request.getImageUrl(),
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
        return Stream.of(address.getDetail(), address.getStreet(), address.getWard(), address.getDistrict(), address.getProvince(), address.getCountry())
                .filter(value -> value != null && !value.isBlank())
                .reduce((left, right) -> left + ", " + right)
                .orElse("");
    }
}
