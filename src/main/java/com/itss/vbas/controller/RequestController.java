package com.itss.vbas.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.itss.vbas.dto.common.CommonDto;
import com.itss.vbas.dto.request.FeeDto;
import com.itss.vbas.dto.request.RequestDto;
import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.enums.AssignmentStatus;
import com.itss.vbas.enums.RescueRequestStatus;
import com.itss.vbas.enums.RoleName;
import com.itss.vbas.enums.StaffStatus;
import com.itss.vbas.exception.BadRequestException;
import com.itss.vbas.exception.ResourceNotFoundException;
import com.itss.vbas.repository.RequestAssignmentRepository;
import com.itss.vbas.repository.RescueStaffRepository;
import com.itss.vbas.security.AuthContext;
import com.itss.vbas.security.RequireAuth;
import com.itss.vbas.security.RequiredRoles;
import com.itss.vbas.service.AdminService;
import com.itss.vbas.service.FeeService;
import com.itss.vbas.service.MessageService;
import com.itss.vbas.service.NotificationService;
import com.itss.vbas.service.PaymentService;
import com.itss.vbas.service.QuoteService;
import com.itss.vbas.service.RequestSupportService;
import com.itss.vbas.service.RescueRequestService;
import com.itss.vbas.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    private final RescueRequestService rescueRequestService;
    private final MessageService messageService;
    private final QuoteService quoteService;
    private final PaymentService paymentService;
    private final ReviewService reviewService;
    private final RequestAssignmentRepository requestAssignmentRepository;
    private final AdminService adminService;
    private final FeeService feeService;
    private final NotificationService notificationService;
    private final AuthContext authContext;
    private final RequestSupportService requestSupportService;
    private final RescueStaffRepository rescueStaffRepository;

    public RequestController(
            RescueRequestService rescueRequestService,
            MessageService messageService,
            QuoteService quoteService,
            PaymentService paymentService,
            ReviewService reviewService,
            RequestAssignmentRepository requestAssignmentRepository,
            AdminService adminService,
            FeeService feeService,
            NotificationService notificationService,
            AuthContext authContext,
            RequestSupportService requestSupportService,
            RescueStaffRepository rescueStaffRepository
    ) {
        this.rescueRequestService = rescueRequestService;
        this.messageService = messageService;
        this.quoteService = quoteService;
        this.paymentService = paymentService;
        this.reviewService = reviewService;
        this.requestAssignmentRepository = requestAssignmentRepository;
        this.adminService = adminService;
        this.feeService = feeService;
        this.notificationService = notificationService;
        this.authContext = authContext;
        this.requestSupportService = requestSupportService;
        this.rescueStaffRepository = rescueStaffRepository;
    }

    @RequireAuth
    @GetMapping("/predict-fee")
    public ResponseEntity<CommonDto.ApiResponse<FeeDto.PredictFeeResponse>> predictFee(
            @RequestParam("serviceTypeId") Long serviceTypeId,
            @RequestParam("latitude") String latitudeValue,
            @RequestParam("longitude") String longitudeValue
    ) {
        BigDecimal latitude = parseDecimalParam(latitudeValue, "Latitude");
        BigDecimal longitude = parseDecimalParam(longitudeValue, "Longitude");
        return ResponseEntity.ok(CommonDto.ApiResponse.success(
                "Estimated fee calculated successfully",
                feeService.predictFee(serviceTypeId, latitude, longitude)
        ));
    }

    @RequiredRoles(RoleName.CUSTOMER)
    @PostMapping
    public ResponseEntity<CommonDto.ApiResponse<RequestDto.RequestDetailResponse>> createRequest(@Valid @RequestBody RequestDto.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonDto.ApiResponse.success("Rescue request created successfully", rescueRequestService.createRequest(request)));
    }

    @RequiredRoles(RoleName.CUSTOMER)
    @GetMapping("/my")
    public ResponseEntity<CommonDto.ApiResponse<List<RequestDto.RequestSummaryResponse>>> getMyRequests() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("My requests fetched successfully", rescueRequestService.getMyRequests()));
    }

    @RequireAuth
    @GetMapping("/{id}")
    public ResponseEntity<CommonDto.ApiResponse<RequestDto.RequestDetailResponse>> getRequestDetail(@PathVariable Long id) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Request detail fetched successfully", rescueRequestService.getRequestDetail(id)));
    }

    @RequireAuth
    @GetMapping("/{id}/tracking")
    public ResponseEntity<CommonDto.ApiResponse<RequestDto.TrackingResponse>> getRequestTracking(@PathVariable Long id) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Request tracking fetched successfully", rescueRequestService.getRequestTracking(id)));
    }

    @RequiredRoles(RoleName.CUSTOMER)
    @PutMapping("/{id}/cancel")
    public ResponseEntity<CommonDto.ApiResponse<Void>> cancelRequest(
            @PathVariable Long id,
            @RequestBody(required = false) RequestDto.PriceDecisionRequest request
    ) {
        rescueRequestService.cancelRequest(id, resolveCustomerNote(request));
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Request canceled successfully"));
    }

    @RequiredRoles(RoleName.CUSTOMER)
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<CommonDto.ApiResponse<Void>> cancelRequestPatch(
            @PathVariable Long id,
            @RequestBody(required = false) RequestDto.PriceDecisionRequest request
    ) {
        rescueRequestService.cancelRequest(id, resolveCustomerNote(request));
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Request canceled successfully"));
    }

    @RequiredRoles({RoleName.ADMIN, RoleName.RESCUE_COMPANY, RoleName.RESCUE_STAFF})
    @PutMapping("/{id}/status")
    public ResponseEntity<CommonDto.ApiResponse<RequestDto.RequestDetailResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody CommonDto.StatusUpdateRequest request
    ) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Request status updated successfully", rescueRequestService.updateRequestStatus(id, request)));
    }

    @RequireAuth
    @GetMapping("/{id}/history")
    public ResponseEntity<CommonDto.ApiResponse<List<RequestDto.StatusHistoryResponse>>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Request history fetched successfully", rescueRequestService.getStatusHistory(id)));
    }

    @RequireAuth
    @GetMapping("/{id}/messages")
    public ResponseEntity<CommonDto.ApiResponse<List<RequestDto.MessageResponse>>> getMessages(@PathVariable Long id) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Messages fetched successfully", messageService.getMessagesByRequest(id)));
    }

    @RequireAuth
    @PostMapping("/{id}/messages")
    public ResponseEntity<CommonDto.ApiResponse<RequestDto.MessageResponse>> sendMessage(
            @PathVariable Long id,
            @Valid @RequestBody RequestDto.MessageCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonDto.ApiResponse.success("Message sent successfully", messageService.sendMessage(id, request)));
    }

    @RequireAuth
    @GetMapping("/{id}/quotes")
    public ResponseEntity<CommonDto.ApiResponse<List<RequestDto.QuoteResponse>>> getQuotes(@PathVariable Long id) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Quotes fetched successfully", quoteService.getQuotesByRequest(id)));
    }

    @RequiredRoles(RoleName.RESCUE_STAFF)
    @PatchMapping("/{id}/deal-price")
    public ResponseEntity<CommonDto.ApiResponse<RequestDto.QuoteResponse>> updateDealPrice(
            @PathVariable Long id,
            @Valid @RequestBody RequestDto.DealPriceRequest request
    ) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Deal price updated successfully", quoteService.updateDealPrice(id, request)));
    }

    @RequiredRoles(RoleName.CUSTOMER)
    @PatchMapping("/{id}/accept-price")
    public ResponseEntity<CommonDto.ApiResponse<RequestDto.QuoteResponse>> acceptPrice(@PathVariable Long id) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Deal price accepted successfully", quoteService.acceptLatestDealPrice(id)));
    }

    @RequiredRoles(RoleName.CUSTOMER)
    @PatchMapping("/{id}/reject-price")
    public ResponseEntity<CommonDto.ApiResponse<RequestDto.QuoteResponse>> rejectPrice(
            @PathVariable Long id,
            @RequestBody(required = false) RequestDto.PriceDecisionRequest request
    ) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Deal price rejected successfully", quoteService.rejectLatestDealPrice(id, request)));
    }

    @RequiredRoles(RoleName.CUSTOMER)
    @PutMapping("/quotes/{quoteId}/accept")
    public ResponseEntity<CommonDto.ApiResponse<RequestDto.QuoteResponse>> acceptQuote(@PathVariable Long quoteId) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Quote accepted successfully", quoteService.acceptQuote(quoteId)));
    }

    @RequiredRoles(RoleName.CUSTOMER)
    @PutMapping("/quotes/{quoteId}/reject")
    public ResponseEntity<CommonDto.ApiResponse<RequestDto.QuoteResponse>> rejectQuote(@PathVariable Long quoteId) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Quote rejected successfully", quoteService.rejectQuote(quoteId)));
    }

    @RequireAuth
    @GetMapping("/{id}/payments")
    public ResponseEntity<CommonDto.ApiResponse<List<RequestDto.PaymentResponse>>> getPayments(@PathVariable Long id) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Payments fetched successfully", paymentService.getPaymentsByRequest(id)));
    }

    @RequiredRoles(RoleName.CUSTOMER)
    @PostMapping("/{id}/payments")
    public ResponseEntity<CommonDto.ApiResponse<RequestDto.PaymentResponse>> createPayment(
            @PathVariable Long id,
            @Valid @RequestBody RequestDto.PaymentCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonDto.ApiResponse.success("Payment created successfully", paymentService.createPayment(id, request)));
    }

    @RequiredRoles(RoleName.CUSTOMER)
    @PostMapping("/{id}/payment")
    public ResponseEntity<CommonDto.ApiResponse<RequestDto.PaymentResponse>> createPaymentSingular(
            @PathVariable Long id,
            @Valid @RequestBody RequestDto.PaymentCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonDto.ApiResponse.success("Payment created successfully", paymentService.createPayment(id, request)));
    }

    @RequiredRoles(RoleName.CUSTOMER)
    @PutMapping("/payments/{paymentId}/pay")
    public ResponseEntity<CommonDto.ApiResponse<RequestDto.PaymentResponse>> pay(
            @PathVariable Long paymentId,
            @Valid @RequestBody RequestDto.PaymentActionRequest request
    ) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Payment updated successfully", paymentService.pay(paymentId, request)));
    }

    @RequiredRoles(RoleName.CUSTOMER)
    @PostMapping("/{id}/reviews")
    public ResponseEntity<CommonDto.ApiResponse<RequestDto.ReviewResponse>> createReview(
            @PathVariable Long id,
            @Valid @RequestBody RequestDto.ReviewCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonDto.ApiResponse.success("Review created successfully", reviewService.createReview(id, request)));
    }

    @RequiredRoles(RoleName.CUSTOMER)
    @PostMapping("/{id}/upload-image")
    public ResponseEntity<CommonDto.ApiResponse<CommonDto.FileUploadResponse>> uploadRequestImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success(
                "Request image uploaded successfully",
                rescueRequestService.uploadRequestImage(id, file)
        ));
    }

    @RequiredRoles(RoleName.RESCUE_STAFF)
    @PutMapping("/assignments/{assignmentId}/accept")
    public ResponseEntity<CommonDto.ApiResponse<Void>> acceptAssignment(@PathVariable Long assignmentId) {
        RequestAssignment assignment = requestAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        assertCurrentStaffOwnsAssignment(assignment);

        if (assignment.getStatus() != AssignmentStatus.PENDING) {
            throw new BadRequestException("Only pending assignments can be accepted");
        }

        AssignmentStatus oldAssignmentStatus = assignment.getStatus();
        assignment.setStatus(AssignmentStatus.ACCEPTED);
        assignment.setAcceptedAt(LocalDateTime.now());
        RequestAssignment savedAssignment = requestAssignmentRepository.save(assignment);

        RescueRequest request = assignment.getRequest();
        rejectOtherPendingAssignments(request, savedAssignment.getId());
        if (savedAssignment.getStaff() != null) {
            savedAssignment.getStaff().setStatus(StaffStatus.BUSY);
            rescueStaffRepository.save(savedAssignment.getStaff());
        }
        requestSupportService.changeRequestStatus(
                request,
                RescueRequestStatus.IN_PROGRESS,
                authContext.getCurrentAccount(),
                "Assignment accepted by staff"
        );
        if (oldAssignmentStatus != AssignmentStatus.ACCEPTED) {
            notificationService.notifyAssignmentAccepted(savedAssignment);
        }

        return ResponseEntity.ok(CommonDto.ApiResponse.success("Assignment accepted successfully"));
    }

    @RequiredRoles(RoleName.RESCUE_STAFF)
    @PutMapping("/assignments/{assignmentId}/reject")
    public ResponseEntity<CommonDto.ApiResponse<Void>> rejectAssignment(@PathVariable Long assignmentId) {
        RequestAssignment assignment = requestAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        assertCurrentStaffOwnsAssignment(assignment);

        if (assignment.getStatus() != AssignmentStatus.PENDING) {
            throw new BadRequestException("Only pending assignments can be rejected");
        }

        assignment.setStatus(AssignmentStatus.REJECTED);
        assignment.setRejectedAt(LocalDateTime.now());
        requestAssignmentRepository.save(assignment);

        RescueRequest request = assignment.getRequest();
        if (!hasOpenPendingAssignment(request) && !hasAcceptedAssignment(request)) {
            if (request.getStatus() != RescueRequestStatus.SEARCHING
                    && request.getStatus() != RescueRequestStatus.CANCELED
                    && request.getStatus() != RescueRequestStatus.COMPLETED) {
                requestSupportService.changeRequestStatus(
                        request,
                        RescueRequestStatus.SEARCHING,
                        authContext.getCurrentAccount(),
                        "Assignment rejected by staff"
                );
            }
            Long assignedByAccountId = assignment.getAssignedByUser() == null
                    ? request.getCustomer().getId()
                    : assignment.getAssignedByUser().getId();
            adminService.autoAssignNearestStaff(request.getId(), assignedByAccountId);
        }

        return ResponseEntity.ok(CommonDto.ApiResponse.success("Assignment rejected successfully"));
    }

    private void assertCurrentStaffOwnsAssignment(RequestAssignment assignment) {
        Account currentAccount = authContext.getCurrentAccount();
        if (assignment.getStaff() == null
                || assignment.getStaff().getUser() == null
                || !assignment.getStaff().getUser().getId().equals(currentAccount.getId())) {
            throw new BadRequestException("This assignment is not assigned to you");
        }
    }

    private void rejectOtherPendingAssignments(RescueRequest request, Long acceptedAssignmentId) {
        LocalDateTime rejectedAt = LocalDateTime.now();
        requestAssignmentRepository.findByRequestIdAndStatus(request.getId(), AssignmentStatus.PENDING)
                .stream()
                .filter(other -> !other.getId().equals(acceptedAssignmentId))
                .forEach(other -> {
                    other.setStatus(AssignmentStatus.REJECTED);
                    other.setRejectedAt(rejectedAt);
                    requestAssignmentRepository.save(other);
                });
    }

    private boolean hasOpenPendingAssignment(RescueRequest request) {
        return requestAssignmentRepository.existsByRequestIdAndStatus(request.getId(), AssignmentStatus.PENDING);
    }

    private boolean hasAcceptedAssignment(RescueRequest request) {
        return requestAssignmentRepository.existsByRequestIdAndStatus(request.getId(), AssignmentStatus.ACCEPTED);
    }

    private String resolveCustomerNote(RequestDto.PriceDecisionRequest request) {
        if (request == null) {
            return null;
        }
        if (request.reason() != null && !request.reason().isBlank()) {
            return request.reason();
        }
        return request.note();
    }

    private BigDecimal parseDecimalParam(String value, String label) {
        try {
            return new BigDecimal(value == null ? "" : value.trim());
        } catch (NumberFormatException e) {
            throw new BadRequestException(label + " must be a valid number");
        }
    }
}
