package com.itss.vbas.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.itss.vbas.dto.common.CommonDto;
import com.itss.vbas.dto.customer.CustomerDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class RequestDto {

    private RequestDto() {
    }

    public record CreateRequest(
            Long vehicleId,
            @NotNull Long incidentTypeId,
            @NotNull Long serviceTypeId,
            @Size(max = 2000) String description,
            @NotBlank String priorityLevel,
            @Valid @NotNull CommonDto.AddressRequest location
    ) {
    }

    public record RequestSummaryResponse(
            Long id,
            String requestCode,
            String status,
            String priorityLevel,
            String description,
            String incidentTypeName,
            String serviceTypeName,
            String locationLabel,
            CommonDto.AddressResponse location,
            String vehicleLabel,
            String imageUrl,
            String customerName,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            CommonDto.BasicCompanyResponse assignedCompany,
            String assignmentStatus,
            Integer timeoutSeconds,
            LocalDateTime expiresAt
    ) {
    }

    public record NearbyRequestSummaryResponse(
            Long id,
            String requestCode,
            String status,
            String priorityLevel,
            String description,
            String incidentTypeName,
            String serviceTypeName,
            String locationLabel,
            CommonDto.AddressResponse location,
            String vehicleLabel,
            String customerName,
            LocalDateTime createdAt,
            Double distanceKm
    ) {
    }

    public record AssignmentRequest(
            Long staffId,
            Long vehicleId,
            @Size(max = 500) String note
    ) {
    }

    public record AssignmentResponse(
            Long id,
            Long requestId,
            Long companyId,
            String companyName,
            Long staffId,
            String staffName,
            String staffAvatarUrl,
            String staffJobTitle,
            Long vehicleId,
            String vehicleCode,
            String vehiclePlateNumber,
            Long assignedByUserId,
            String assignedByUserName,
            LocalDateTime assignedAt,
            LocalDateTime acceptedAt,
            LocalDateTime rejectedAt,
            String status,
            Integer timeoutSeconds,
            LocalDateTime expiresAt
    ) {
    }

    public record StatusHistoryResponse(
            Long id,
            String oldStatus,
            String newStatus,
            Long changedByUserId,
            String changedByUserName,
            String note,
            LocalDateTime changedAt
    ) {
    }

    public record QuoteResponse(
            Long id,
            String quoteCode,
            Long requestId,
            Long companyId,
            String companyName,
            Long staffId,
            String staffName,
            BigDecimal estimatedAmount,
            BigDecimal finalAmount,
            String status,
            LocalDateTime createdAt,
            LocalDateTime expiresAt,
            String serviceName,
            Integer quantity,
            BigDecimal unitPrice,
            BigDecimal subtotal,
            String note,
            String customerNote
    ) {
    }

    public record DealPriceRequest(
            @NotNull @DecimalMin(value = "0.01") BigDecimal dealPrice,
            @Size(max = 2000) String note
    ) {
    }

    public record PriceDecisionRequest(
            @Size(max = 2000) String reason,
            @Size(max = 2000) String note
    ) {
    }

    public record PaymentCreateRequest(
            BigDecimal amount,
            @NotBlank String paymentMethod
    ) {
    }

    public record PaymentActionRequest(
            @NotBlank String paymentStatus
    ) {
    }

    public record PaymentResponse(
            Long id,
            Long requestId,
            Long customerId,
            BigDecimal amount,
            String paymentMethod,
            String paymentStatus,
            LocalDateTime createdAt,
            LocalDateTime paidAt
    ) {
    }

    public record MessageCreateRequest(
            @NotBlank @Size(max = 2000) String content
    ) {
    }

    public record MessageResponse(
            Long id,
            Long requestId,
            Long senderId,
            String senderName,
            String senderRole,
            String content,
            LocalDateTime sentAt
    ) {
    }

    public record ReviewCreateRequest(
            @NotNull @Min(1) @Max(5) Integer ratingScore,
            @Size(max = 2000) String comment
    ) {
    }

    public record ReviewResponse(
            Long id,
            Long requestId,
            String customerName,
            String companyName,
            String staffName,
            Integer ratingScore,
            String comment,
            LocalDateTime createdAt
    ) {
    }

    public record TrackingPointResponse(
            BigDecimal latitude,
            BigDecimal longitude,
            String label
    ) {
    }

    public record TrackingStaffResponse(
            Long id,
            String name,
            String phone,
            String jobTitle,
            Double rating,
            TrackingPointResponse location
    ) {
    }

    public record TrackingVehicleResponse(
            Long id,
            String vehicleCode,
            String vehicleType,
            String plateNumber
    ) {
    }

    public record TrackingPendingStaffResponse(
            Long assignmentId,
            Long staffId,
            String name,
            String phone,
            String jobTitle,
            String vehicleCode,
            String vehiclePlateNumber,
            LocalDateTime assignedAt,
            LocalDateTime expiresAt
    ) {
    }

    public record TrackingResponse(
            Long requestId,
            String requestStatus,
            boolean assigned,
            boolean hasDestination,
            TrackingPointResponse destination,
            TrackingStaffResponse staff,
            TrackingVehicleResponse vehicle,
            List<TrackingPendingStaffResponse> pendingStaff,
            List<TrackingPointResponse> route,
            String routeSource,
            String movementStatus,
            Integer etaMinutes,
            LocalDateTime updatedAt
    ) {
    }

    public record EstimatedQuotationResponse(
            Long serviceTypeId,
            String serviceName,
            BigDecimal servicePrice,
            BigDecimal travelCost,
            BigDecimal coefficient,
            BigDecimal estimatedAmount
    ) {
    }

    public record RequestDetailResponse(
            Long id,
            String requestCode,
            String status,
            String priorityLevel,
            String description,
            String imageUrl,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            CommonDto.AccountSummaryResponse customer,
            CustomerDto.VehicleResponse vehicle,
            CommonDto.LookupResponse incidentType,
            CommonDto.LookupResponse serviceType,
            CommonDto.AddressResponse location,
            CommonDto.BasicCompanyResponse assignedCompany,
            AssignmentResponse currentAssignment,
            EstimatedQuotationResponse estimatedQuotation,
            List<StatusHistoryResponse> history,
            List<QuoteResponse> quotes,
            List<PaymentResponse> payments,
            ReviewResponse review
    ) {
    }
}
