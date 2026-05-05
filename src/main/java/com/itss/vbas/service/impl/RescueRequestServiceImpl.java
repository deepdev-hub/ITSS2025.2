package com.itss.vbas.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import com.itss.vbas.dto.common.CommonDto;
import com.itss.vbas.dto.request.RequestDto;
import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.CustomerVehicle;
import com.itss.vbas.entity.IncidentType;
import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.entity.RequestStatusHistory;
import com.itss.vbas.entity.RescueCompany;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.entity.RescueStaff;
import com.itss.vbas.entity.ServiceType;
import com.itss.vbas.enums.AssignmentStatus;
import com.itss.vbas.enums.RequestPriority;
import com.itss.vbas.enums.RescueRequestStatus;
import com.itss.vbas.enums.RoleName;
import com.itss.vbas.exception.BadRequestException;
import com.itss.vbas.exception.ForbiddenException;
import com.itss.vbas.exception.ResourceNotFoundException;
import com.itss.vbas.mapper.AppMapper;
import com.itss.vbas.repository.CustomerVehicleRepository;
import com.itss.vbas.repository.IncidentTypeRepository;
import com.itss.vbas.repository.PaymentRepository;
import com.itss.vbas.repository.QuoteRepository;
import com.itss.vbas.repository.RequestAssignmentRepository;
import com.itss.vbas.repository.RequestStatusHistoryRepository;
import com.itss.vbas.repository.RescueRequestRepository;
import com.itss.vbas.repository.ReviewRepository;
import com.itss.vbas.repository.ServiceTypeRepository;
import com.itss.vbas.security.AuthContext;
import com.itss.vbas.service.AddressService;
import com.itss.vbas.service.RequestSupportService;
import com.itss.vbas.service.RescueRequestService;
import com.itss.vbas.util.CodeGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RescueRequestServiceImpl implements RescueRequestService {

    private final RescueRequestRepository rescueRequestRepository;
    private final CustomerVehicleRepository customerVehicleRepository;
    private final IncidentTypeRepository incidentTypeRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final RequestStatusHistoryRepository requestStatusHistoryRepository;
    private final RequestAssignmentRepository requestAssignmentRepository;
    private final QuoteRepository quoteRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;
    private final AddressService addressService;
    private final RequestSupportService requestSupportService;
    private final AuthContext authContext;
    private final AppMapper appMapper;

    public RescueRequestServiceImpl(
            RescueRequestRepository rescueRequestRepository,
            CustomerVehicleRepository customerVehicleRepository,
            IncidentTypeRepository incidentTypeRepository,
            ServiceTypeRepository serviceTypeRepository,
            RequestStatusHistoryRepository requestStatusHistoryRepository,
            RequestAssignmentRepository requestAssignmentRepository,
            QuoteRepository quoteRepository,
            PaymentRepository paymentRepository,
            ReviewRepository reviewRepository,
            AddressService addressService,
            RequestSupportService requestSupportService,
            AuthContext authContext,
            AppMapper appMapper
    ) {
        this.rescueRequestRepository = rescueRequestRepository;
        this.customerVehicleRepository = customerVehicleRepository;
        this.incidentTypeRepository = incidentTypeRepository;
        this.serviceTypeRepository = serviceTypeRepository;
        this.requestStatusHistoryRepository = requestStatusHistoryRepository;
        this.requestAssignmentRepository = requestAssignmentRepository;
        this.quoteRepository = quoteRepository;
        this.paymentRepository = paymentRepository;
        this.reviewRepository = reviewRepository;
        this.addressService = addressService;
        this.requestSupportService = requestSupportService;
        this.authContext = authContext;
        this.appMapper = appMapper;
    }

    @Override
    public RequestDto.RequestDetailResponse createRequest(RequestDto.CreateRequest request) {
        Account customer = authContext.getCurrentAccount();
        if (customer.getRole().getRoleName() != RoleName.CUSTOMER) {
            throw new ForbiddenException("Only customers can create rescue requests");
        }

        IncidentType incidentType = incidentTypeRepository.findById(request.incidentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Incident type not found with id: " + request.incidentTypeId()));
        ServiceType serviceType = request.serviceTypeId() == null ? null : serviceTypeRepository.findById(request.serviceTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Service type not found with id: " + request.serviceTypeId()));
        CustomerVehicle vehicle = request.vehicleId() == null ? null : customerVehicleRepository.findByIdAndCustomerId(request.vehicleId(), customer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + request.vehicleId()));

        RescueRequest rescueRequest = RescueRequest.builder()
                .requestCode(CodeGenerator.requestCode())
                .customer(customer)
                .vehicle(vehicle)
                .incidentType(incidentType)
                .serviceType(serviceType)
                .location(addressService.createAddress(request.location()))
                .description(request.description())
                .priorityLevel(parsePriority(request.priorityLevel()))
                .status(RescueRequestStatus.CREATED)
                .build();

        RescueRequest savedRequest = rescueRequestRepository.save(rescueRequest);
        requestStatusHistoryRepository.save(RequestStatusHistory.builder()
                .request(savedRequest)
                .oldStatus(null)
                .newStatus(RescueRequestStatus.CREATED)
                .changedByUser(customer)
                .note("Request created")
                .changedAt(LocalDateTime.now())
                .build());
        return buildDetail(savedRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequestDto.RequestSummaryResponse> getMyRequests() {
        Account customer = authContext.getCurrentAccount();
        return rescueRequestRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId())
                .stream()
                .map(request -> appMapper.toRequestSummaryResponse(
                        request,
                        requestSupportService.getAssignedCompany(request),
                        requestSupportService.getLatestAssignment(request)
                ))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RequestDto.RequestDetailResponse getRequestDetail(Long requestId) {
        Account account = authContext.getCurrentAccount();
        RescueRequest rescueRequest = findRequest(requestId);
        requestSupportService.assertRequestParticipant(account, rescueRequest);
        return buildDetail(rescueRequest);
    }

    @Override
    public void cancelRequest(Long requestId, String note) {
        Account customer = authContext.getCurrentAccount();
        RescueRequest rescueRequest = findRequest(requestId);
        if (!rescueRequest.getCustomer().getId().equals(customer.getId())) {
            throw new ForbiddenException("You can only cancel your own request");
        }
        if (rescueRequest.getStatus() == RescueRequestStatus.COMPLETED || rescueRequest.getStatus() == RescueRequestStatus.CANCELED) {
            throw new BadRequestException("This request can no longer be canceled");
        }
        requestSupportService.changeRequestStatus(rescueRequest, RescueRequestStatus.CANCELED, customer, note);
        RequestAssignment latestAssignment = requestSupportService.getLatestAssignment(rescueRequest);
        if (latestAssignment != null && latestAssignment.getStatus() != AssignmentStatus.COMPLETED) {
            latestAssignment.setStatus(AssignmentStatus.REJECTED);
            latestAssignment.setRejectedAt(LocalDateTime.now());
            requestAssignmentRepository.save(latestAssignment);
        }
    }

    @Override
    public RequestDto.RequestDetailResponse updateRequestStatus(Long requestId, CommonDto.StatusUpdateRequest request) {
        Account account = authContext.getCurrentAccount();
        RescueRequest rescueRequest = findRequest(requestId);
        RescueRequestStatus newStatus = parseStatus(request.status());
        RoleName roleName = account.getRole().getRoleName();

        if (roleName == RoleName.CUSTOMER) {
            throw new ForbiddenException("Customers cannot use this endpoint to update request status");
        }
        if (roleName == RoleName.RESCUE_COMPANY) {
            RescueCompany company = requestSupportService.getCurrentCompany(account);
            requestSupportService.assertAssignedCompany(company, rescueRequest);
            if (!(newStatus == RescueRequestStatus.MATCHED || newStatus == RescueRequestStatus.IN_PROGRESS
                    || newStatus == RescueRequestStatus.COMPLETED || newStatus == RescueRequestStatus.CANCELED)) {
                throw new BadRequestException("Company can only set MATCHED, IN_PROGRESS, COMPLETED, or CANCELED");
            }
        }
        if (roleName == RoleName.RESCUE_STAFF) {
            RescueStaff staff = requestSupportService.getCurrentStaff(account);
            requestSupportService.assertAssignedStaff(staff, rescueRequest);
            if (!(newStatus == RescueRequestStatus.IN_PROGRESS || newStatus == RescueRequestStatus.COMPLETED
                    || newStatus == RescueRequestStatus.CANCELED)) {
                throw new BadRequestException("Staff can only set IN_PROGRESS, COMPLETED, or CANCELED");
            }
        }

        requestSupportService.changeRequestStatus(rescueRequest, newStatus, account, request.note());
        if (newStatus == RescueRequestStatus.COMPLETED) {
            RequestAssignment latestAssignment = requestSupportService.getLatestAssignment(rescueRequest);
            if (latestAssignment != null) {
                latestAssignment.setStatus(AssignmentStatus.COMPLETED);
                requestAssignmentRepository.save(latestAssignment);
            }
        }
        return buildDetail(rescueRequestRepository.findById(requestId).orElseThrow());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequestDto.StatusHistoryResponse> getStatusHistory(Long requestId) {
        Account account = authContext.getCurrentAccount();
        RescueRequest rescueRequest = findRequest(requestId);
        requestSupportService.assertRequestParticipant(account, rescueRequest);
        return requestStatusHistoryRepository.findByRequestIdOrderByChangedAtAsc(requestId)
                .stream()
                .map(appMapper::toStatusHistoryResponse)
                .toList();
    }

    private RescueRequest findRequest(Long requestId) {
        return rescueRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Rescue request not found with id: " + requestId));
    }

    private RequestDto.RequestDetailResponse buildDetail(RescueRequest rescueRequest) {
        return appMapper.toRequestDetailResponse(
                rescueRequest,
                requestSupportService.getAssignedCompany(rescueRequest),
                requestSupportService.getLatestAssignment(rescueRequest),
                requestStatusHistoryRepository.findByRequestIdOrderByChangedAtAsc(rescueRequest.getId()).stream().map(appMapper::toStatusHistoryResponse).toList(),
                quoteRepository.findByRequestIdOrderByCreatedAtDesc(rescueRequest.getId()).stream().map(appMapper::toQuoteResponse).toList(),
                paymentRepository.findByRequestIdOrderByIdDesc(rescueRequest.getId()).stream().map(appMapper::toPaymentResponse).toList(),
                reviewRepository.findByRequestId(rescueRequest.getId()).map(appMapper::toReviewResponse).orElse(null)
        );
    }

    private RequestPriority parsePriority(String value) {
        try {
            return RequestPriority.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid request priority: " + value);
        }
    }

    private RescueRequestStatus parseStatus(String value) {
        try {
            return RescueRequestStatus.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid request status: " + value);
        }
    }
}
