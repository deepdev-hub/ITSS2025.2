package com.itss.vbas.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.itss.vbas.dto.company.CompanyDto;
import com.itss.vbas.dto.request.RequestDto;
import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.Quote;
import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.entity.RescueCompany;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.entity.RescueStaff;
import com.itss.vbas.enums.AssignmentStatus;
import com.itss.vbas.enums.PaymentStatus;
import com.itss.vbas.enums.QuoteStatus;
import com.itss.vbas.enums.RescueRequestStatus;
import com.itss.vbas.exception.BadRequestException;
import com.itss.vbas.exception.ForbiddenException;
import com.itss.vbas.exception.ResourceNotFoundException;
import com.itss.vbas.mapper.AppMapper;
import com.itss.vbas.repository.PaymentRepository;
import com.itss.vbas.repository.QuoteRepository;
import com.itss.vbas.repository.RescueRequestRepository;
import com.itss.vbas.repository.RescueStaffRepository;
import com.itss.vbas.security.AuthContext;
import com.itss.vbas.service.QuoteService;
import com.itss.vbas.service.RequestSupportService;
import com.itss.vbas.util.CodeGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class QuoteServiceImpl implements QuoteService {

    private final QuoteRepository quoteRepository;
    private final PaymentRepository paymentRepository;
    private final RescueRequestRepository rescueRequestRepository;
    private final RescueStaffRepository rescueStaffRepository;
    private final RequestSupportService requestSupportService;
    private final AuthContext authContext;
    private final AppMapper appMapper;

    public QuoteServiceImpl(
            QuoteRepository quoteRepository,
            PaymentRepository paymentRepository,
            RescueRequestRepository rescueRequestRepository,
            RescueStaffRepository rescueStaffRepository,
            RequestSupportService requestSupportService,
            AuthContext authContext,
            AppMapper appMapper
    ) {
        this.quoteRepository = quoteRepository;
        this.paymentRepository = paymentRepository;
        this.rescueRequestRepository = rescueRequestRepository;
        this.rescueStaffRepository = rescueStaffRepository;
        this.requestSupportService = requestSupportService;
        this.authContext = authContext;
        this.appMapper = appMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequestDto.QuoteResponse> getQuotesByRequest(Long requestId) {
        RescueRequest rescueRequest = findRequest(requestId);
        requestSupportService.assertRequestParticipant(authContext.getCurrentAccount(), rescueRequest);
        return quoteRepository.findByRequestIdOrderByCreatedAtDesc(requestId)
                .stream()
                .map(appMapper::toQuoteResponse)
                .toList();
    }

    @Override
    public RequestDto.QuoteResponse createOrUpdateQuote(Long requestId, CompanyDto.QuoteRequest request) {
        Account account = authContext.getCurrentAccount();
        RescueCompany company = requestSupportService.getCurrentCompany(account);
        RescueRequest rescueRequest = findRequest(requestId);
        requestSupportService.assertAssignedCompany(company, rescueRequest);
        ensureRequestCanNegotiate(rescueRequest);

        RescueStaff staff = resolveStaff(request.staffId(), company.getId());
        Quote quote = quoteRepository.findFirstByRequestIdOrderByCreatedAtDesc(requestId)
                .filter(existing -> existing.getCompany().getId().equals(company.getId()) && existing.getStatus() != QuoteStatus.ACCEPTED)
                .orElseGet(() -> Quote.builder()
                        .request(rescueRequest)
                        .company(company)
                        .quoteCode(CodeGenerator.quoteCode())
                        .status(QuoteStatus.DRAFT)
                        .build());

        BigDecimal subtotal = resolveSubtotal(request.quantity(), request.unitPrice(), request.subtotal());
        BigDecimal finalAmount = request.finalAmount() != null ? request.finalAmount() : subtotal;
        quote.setStaff(staff);
        quote.setEstimatedAmount(request.estimatedAmount() != null ? request.estimatedAmount() : finalAmount);
        quote.setFinalAmount(finalAmount);
        quote.setServiceName(request.serviceName() == null || request.serviceName().isBlank()
                ? rescueRequest.getServiceType() == null ? "Breakdown Assistance" : rescueRequest.getServiceType().getServiceName()
                : request.serviceName());
        quote.setQuantity(request.quantity());
        quote.setUnitPrice(request.unitPrice());
        quote.setSubtotal(subtotal);
        quote.setExpiresAt(request.expiresAt());
        quote.setNote(request.note());
        quote.setStatus(QuoteStatus.DRAFT);

        return appMapper.toQuoteResponse(quoteRepository.save(quote));
    }

    @Override
    public RequestDto.QuoteResponse updateDealPrice(Long requestId, RequestDto.DealPriceRequest request) {
        Account account = authContext.getCurrentAccount();
        RescueRequest rescueRequest = findRequest(requestId);
        ensureRequestCanNegotiate(rescueRequest);

        RescueStaff staff = requestSupportService.getCurrentStaff(account);
        requestSupportService.assertAssignedStaff(staff, rescueRequest);
        Quote latestQuote = quoteRepository.findFirstByRequestIdOrderByCreatedAtDesc(requestId).orElse(null);
        RequestAssignment assignment = requestSupportService.getLatestAssignment(rescueRequest);
        if (latestQuote != null && latestQuote.getStatus() == QuoteStatus.ACCEPTED) {
            throw new BadRequestException("Accepted deal price cannot be changed");
        }
        if (assignment == null || assignment.getStatus() != AssignmentStatus.ACCEPTED) {
            throw new BadRequestException("Staff must accept the assignment before sending a deal price");
        }

        RescueCompany company = staff.getCompany() != null ? staff.getCompany() : assignment.getCompany();
        if (company == null) {
            throw new BadRequestException("Assigned staff must belong to a rescue company");
        }

        Quote quote = Quote.builder()
                .request(rescueRequest)
                .company(company)
                .quoteCode(CodeGenerator.quoteCode())
                .status(QuoteStatus.DRAFT)
                .build();

        BigDecimal dealPrice = request.dealPrice();
        quote.setStaff(staff);
        quote.setEstimatedAmount(quote.getEstimatedAmount() != null ? quote.getEstimatedAmount() : dealPrice);
        quote.setFinalAmount(dealPrice);
        quote.setServiceName(rescueRequest.getServiceType() == null
                ? "Breakdown Assistance"
                : rescueRequest.getServiceType().getServiceName());
        quote.setQuantity(quote.getQuantity() == null ? 1 : quote.getQuantity());
        quote.setUnitPrice(dealPrice);
        quote.setSubtotal(dealPrice);
        quote.setNote(request.note());
        quote.setCustomerNote(null);
        quote.setStatus(QuoteStatus.SENT);

        return appMapper.toQuoteResponse(quoteRepository.save(quote));
    }

    @Override
    public RequestDto.QuoteResponse acceptLatestDealPrice(Long requestId) {
        RescueRequest rescueRequest = findRequest(requestId);
        Account customer = requireCurrentCustomer(rescueRequest);
        ensureRequestCanPayOrDecide(rescueRequest);

        Quote quote = findLatestSentQuote(requestId);
        ensureQuoteHasDealPrice(quote);
        quote.setStatus(QuoteStatus.ACCEPTED);
        Quote savedQuote = quoteRepository.save(quote);
        requestSupportService.changeRequestStatus(rescueRequest, RescueRequestStatus.ACCEPTED, customer, "Deal price accepted");
        return appMapper.toQuoteResponse(savedQuote);
    }

    @Override
    public RequestDto.QuoteResponse rejectLatestDealPrice(Long requestId, RequestDto.PriceDecisionRequest request) {
        RescueRequest rescueRequest = findRequest(requestId);
        Account customer = requireCurrentCustomer(rescueRequest);
        ensureRequestCanPayOrDecide(rescueRequest);

        Quote quote = findLatestSentQuote(requestId);
        ensureQuoteHasDealPrice(quote);
        String reason = resolveCustomerNote(request);
        quote.setStatus(QuoteStatus.REJECTED);
        quote.setCustomerNote(reason);
        Quote savedQuote = quoteRepository.save(quote);
        requestSupportService.changeRequestStatus(rescueRequest, RescueRequestStatus.MATCHED, customer,
                reason == null || reason.isBlank() ? "Deal price rejected" : reason);
        return appMapper.toQuoteResponse(savedQuote);
    }

    @Override
    public RequestDto.QuoteResponse sendQuote(Long quoteId) {
        Account account = authContext.getCurrentAccount();
        RescueCompany company = requestSupportService.getCurrentCompany(account);
        Quote quote = quoteRepository.findByIdAndCompanyId(quoteId, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Quote not found with id: " + quoteId));
        ensureRequestCanNegotiate(quote.getRequest());
        if (quote.getStatus() == QuoteStatus.ACCEPTED) {
            throw new BadRequestException("Accepted quote cannot be sent again");
        }
        quote.setStatus(QuoteStatus.SENT);
        return appMapper.toQuoteResponse(quoteRepository.save(quote));
    }

    @Override
    public RequestDto.QuoteResponse acceptQuote(Long quoteId) {
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new ResourceNotFoundException("Quote not found with id: " + quoteId));
        RescueRequest rescueRequest = quote.getRequest();
        Account customer = requireCurrentCustomer(rescueRequest);
        ensureQuoteCanBeActioned(quote);
        ensureQuoteHasDealPrice(quote);
        quote.setStatus(QuoteStatus.ACCEPTED);
        Quote savedQuote = quoteRepository.save(quote);
        requestSupportService.changeRequestStatus(rescueRequest, RescueRequestStatus.ACCEPTED, customer, "Quote accepted");
        return appMapper.toQuoteResponse(savedQuote);
    }

    @Override
    public RequestDto.QuoteResponse rejectQuote(Long quoteId) {
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new ResourceNotFoundException("Quote not found with id: " + quoteId));
        RescueRequest rescueRequest = quote.getRequest();
        Account customer = requireCurrentCustomer(rescueRequest);
        ensureQuoteCanBeActioned(quote);
        quote.setStatus(QuoteStatus.REJECTED);
        Quote savedQuote = quoteRepository.save(quote);
        requestSupportService.changeRequestStatus(rescueRequest, RescueRequestStatus.MATCHED, customer, "Quote rejected");
        return appMapper.toQuoteResponse(savedQuote);
    }

    private RescueRequest findRequest(Long requestId) {
        return rescueRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Rescue request not found with id: " + requestId));
    }

    private RescueStaff resolveStaff(Long staffId, Long companyId) {
        if (staffId == null) {
            return null;
        }
        return rescueStaffRepository.findByIdAndCompanyId(staffId, companyId)
                .orElseThrow(() -> new BadRequestException("Selected staff does not belong to your company"));
    }

    private BigDecimal resolveSubtotal(Integer quantity, BigDecimal unitPrice, BigDecimal subtotal) {
        if (subtotal != null) {
            return subtotal;
        }
        if (quantity != null && unitPrice != null) {
            return unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
        return null;
    }

    private void ensureQuoteCanBeActioned(Quote quote) {
        if (quote.getStatus() != QuoteStatus.SENT) {
            throw new BadRequestException("Only sent quotes can be accepted or rejected");
        }
        ensureRequestCanPayOrDecide(quote.getRequest());
        if (quote.getExpiresAt() != null && quote.getExpiresAt().isBefore(LocalDateTime.now())) {
            quote.setStatus(QuoteStatus.EXPIRED);
            quoteRepository.save(quote);
            throw new BadRequestException("This quote has already expired");
        }
    }

    private Quote findLatestSentQuote(Long requestId) {
        return quoteRepository.findByRequestIdOrderByCreatedAtDesc(requestId)
                .stream()
                .filter(quote -> quote.getStatus() == QuoteStatus.SENT)
                .findFirst()
                .orElseThrow(() -> new BadRequestException("No deal price is waiting for customer confirmation"));
    }

    private void ensureQuoteHasDealPrice(Quote quote) {
        BigDecimal amount = quote.getFinalAmount() != null ? quote.getFinalAmount() : quote.getEstimatedAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("A valid deal price is required before this action");
        }
    }

    private void ensureRequestCanNegotiate(RescueRequest rescueRequest) {
        if (rescueRequest.getStatus() == RescueRequestStatus.CANCELED) {
            throw new BadRequestException("Canceled request cannot be negotiated");
        }
        if (rescueRequest.getStatus() == RescueRequestStatus.COMPLETED) {
            throw new BadRequestException("Completed request cannot be negotiated");
        }
        if (paymentRepository.existsByRequestIdAndPaymentStatus(rescueRequest.getId(), PaymentStatus.PAID)) {
            throw new BadRequestException("Paid request cannot be negotiated");
        }
    }

    private void ensureRequestCanPayOrDecide(RescueRequest rescueRequest) {
        if (rescueRequest.getStatus() == RescueRequestStatus.CANCELED) {
            throw new BadRequestException("Canceled request cannot continue price or payment flow");
        }
        if (paymentRepository.existsByRequestIdAndPaymentStatus(rescueRequest.getId(), PaymentStatus.PAID)) {
            throw new BadRequestException("This request has already been paid");
        }
    }

    private Account requireCurrentCustomer(RescueRequest rescueRequest) {
        Account account = authContext.getCurrentAccount();
        if (!rescueRequest.getCustomer().getId().equals(account.getId())) {
            throw new ForbiddenException("You can only decide the price for your own request");
        }
        return account;
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
}
