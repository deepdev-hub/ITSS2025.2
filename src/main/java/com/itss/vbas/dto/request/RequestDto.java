package com.itss.vbas.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.itss.vbas.dto.common.CommonDto;
import com.itss.vbas.dto.customer.CustomerDto;
import jakarta.validation.Valid;
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
            Long serviceTypeId,
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
            String vehicleLabel,
            String customerName,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            CommonDto.BasicCompanyResponse assignedCompany
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
            Long vehicleId,
            String vehicleCode,
            String vehiclePlateNumber,
            Long assignedByUserId,
            String assignedByUserName,
            LocalDateTime assignedAt,
            LocalDateTime acceptedAt,
            LocalDateTime rejectedAt,
            String status
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
            BigDecimal subtotal
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

    public record RequestDetailResponse(
            Long id,
            String requestCode,
            String status,
            String priorityLevel,
            String description,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            CommonDto.AccountSummaryResponse customer,
            CustomerDto.VehicleResponse vehicle,
            CommonDto.LookupResponse incidentType,
            CommonDto.LookupResponse serviceType,
            CommonDto.AddressResponse location,
            CommonDto.BasicCompanyResponse assignedCompany,
            AssignmentResponse currentAssignment,
            List<StatusHistoryResponse> history,
            List<QuoteResponse> quotes,
            List<PaymentResponse> payments,
            ReviewResponse review
    ) {
    }
}
