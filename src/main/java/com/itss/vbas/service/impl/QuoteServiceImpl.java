package com.itss.vbas.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.itss.vbas.dto.company.CompanyDto;
import com.itss.vbas.dto.request.RequestDto;
import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.Quote;
import com.itss.vbas.entity.RescueCompany;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.entity.RescueStaff;
import com.itss.vbas.enums.QuoteStatus;
import com.itss.vbas.enums.RescueRequestStatus;
import com.itss.vbas.exception.BadRequestException;
import com.itss.vbas.exception.ForbiddenException;
import com.itss.vbas.exception.ResourceNotFoundException;
import com.itss.vbas.mapper.AppMapper;
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
    private final RescueRequestRepository rescueRequestRepository;
    private final RescueStaffRepository rescueStaffRepository;
    private final RequestSupportService requestSupportService;
    private final AuthContext authContext;
    private final AppMapper appMapper;

    public QuoteServiceImpl(
            QuoteRepository quoteRepository,
            RescueRequestRepository rescueRequestRepository,
            RescueStaffRepository rescueStaffRepository,
            RequestSupportService requestSupportService,
            AuthContext authContext,
            AppMapper appMapper
    ) {
        this.quoteRepository = quoteRepository;
        this.rescueRequestRepository = rescueRequestRepository;
        this.rescueStaffRepository = rescueStaffRepository;
        this.requestSupportService = requestSupportService;
        this.authContext = authContext;
        this.appMapper = appMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequestDto.QuoteResponse> getQuotesByRequest(Long requestId) {
        Account account = authContext.getCurrentAccount();
        RescueRequest rescueRequest = findRequest(requestId);
        requestSupportService.assertRequestParticipant(account, rescueRequest);
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
        quote.setStatus(QuoteStatus.DRAFT);

        return appMapper.toQuoteResponse(quoteRepository.save(quote));
    }

    @Override
    public RequestDto.QuoteResponse sendQuote(Long quoteId) {
        Account account = authContext.getCurrentAccount();
        RescueCompany company = requestSupportService.getCurrentCompany(account);
        Quote quote = quoteRepository.findByIdAndCompanyId(quoteId, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Quote not found with id: " + quoteId));
        if (quote.getStatus() == QuoteStatus.ACCEPTED) {
            throw new BadRequestException("Accepted quote cannot be sent again");
        }
        quote.setStatus(QuoteStatus.SENT);
        return appMapper.toQuoteResponse(quoteRepository.save(quote));
    }

    @Override
    public RequestDto.QuoteResponse acceptQuote(Long quoteId) {
        Account customer = authContext.getCurrentAccount();
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new ResourceNotFoundException("Quote not found with id: " + quoteId));
        RescueRequest rescueRequest = quote.getRequest();
        if (!rescueRequest.getCustomer().getId().equals(customer.getId())) {
            throw new ForbiddenException("You can only accept quotes for your own request");
        }
        ensureQuoteCanBeActioned(quote);
        quote.setStatus(QuoteStatus.ACCEPTED);
        Quote savedQuote = quoteRepository.save(quote);
        requestSupportService.changeRequestStatus(rescueRequest, RescueRequestStatus.ACCEPTED, customer, "Customer accepted quote");
        return appMapper.toQuoteResponse(savedQuote);
    }

    @Override
    public RequestDto.QuoteResponse rejectQuote(Long quoteId) {
        Account customer = authContext.getCurrentAccount();
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new ResourceNotFoundException("Quote not found with id: " + quoteId));
        RescueRequest rescueRequest = quote.getRequest();
        if (!rescueRequest.getCustomer().getId().equals(customer.getId())) {
            throw new ForbiddenException("You can only reject quotes for your own request");
        }
        ensureQuoteCanBeActioned(quote);
        quote.setStatus(QuoteStatus.REJECTED);
        Quote savedQuote = quoteRepository.save(quote);
        requestSupportService.changeRequestStatus(rescueRequest, RescueRequestStatus.MATCHED, customer, "Customer rejected quote");
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
        if (quote.getExpiresAt() != null && quote.getExpiresAt().isBefore(LocalDateTime.now())) {
            quote.setStatus(QuoteStatus.EXPIRED);
            quoteRepository.save(quote);
            throw new BadRequestException("This quote has already expired");
        }
    }
}
