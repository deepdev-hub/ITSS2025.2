package com.itss.vbas.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import com.itss.vbas.dto.request.RequestDto;
import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.Payment;
import com.itss.vbas.entity.Quote;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.enums.PaymentMethod;
import com.itss.vbas.enums.PaymentStatus;
import com.itss.vbas.exception.BadRequestException;
import com.itss.vbas.exception.ForbiddenException;
import com.itss.vbas.exception.ResourceNotFoundException;
import com.itss.vbas.mapper.AppMapper;
import com.itss.vbas.repository.PaymentRepository;
import com.itss.vbas.repository.QuoteRepository;
import com.itss.vbas.repository.RescueRequestRepository;
import com.itss.vbas.security.AuthContext;
import com.itss.vbas.service.PaymentService;
import com.itss.vbas.service.RequestSupportService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final QuoteRepository quoteRepository;
    private final RescueRequestRepository rescueRequestRepository;
    private final RequestSupportService requestSupportService;
    private final AuthContext authContext;
    private final AppMapper appMapper;

    public PaymentServiceImpl(
            PaymentRepository paymentRepository,
            QuoteRepository quoteRepository,
            RescueRequestRepository rescueRequestRepository,
            RequestSupportService requestSupportService,
            AuthContext authContext,
            AppMapper appMapper
    ) {
        this.paymentRepository = paymentRepository;
        this.quoteRepository = quoteRepository;
        this.rescueRequestRepository = rescueRequestRepository;
        this.requestSupportService = requestSupportService;
        this.authContext = authContext;
        this.appMapper = appMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequestDto.PaymentResponse> getPaymentsByRequest(Long requestId) {
        Account account = authContext.getCurrentAccount();
        RescueRequest rescueRequest = findRequest(requestId);
        requestSupportService.assertRequestParticipant(account, rescueRequest);
        return paymentRepository.findByRequestIdOrderByIdDesc(requestId)
                .stream()
                .map(appMapper::toPaymentResponse)
                .toList();
    }

    @Override
    public RequestDto.PaymentResponse createPayment(Long requestId, RequestDto.PaymentCreateRequest request) {
        Account customer = authContext.getCurrentAccount();
        RescueRequest rescueRequest = findRequest(requestId);
        if (!rescueRequest.getCustomer().getId().equals(customer.getId())) {
            throw new ForbiddenException("You can only create payment for your own request");
        }

        Payment existingPayment = paymentRepository.findFirstByRequestIdOrderByIdDesc(requestId).orElse(null);
        if (existingPayment != null && existingPayment.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("This request has already been paid");
        }
        if (existingPayment != null && existingPayment.getPaymentStatus() == PaymentStatus.PENDING) {
            return appMapper.toPaymentResponse(existingPayment);
        }

        Quote acceptedQuote = quoteRepository.findByRequestIdOrderByCreatedAtDesc(requestId)
                .stream()
                .filter(quote -> quote.getStatus().name().equals("ACCEPTED"))
                .findFirst()
                .orElse(null);

        Payment payment = Payment.builder()
                .request(rescueRequest)
                .customer(customer)
                .amount(request.amount() != null ? request.amount() : resolveQuoteAmount(acceptedQuote))
                .paymentMethod(parsePaymentMethod(request.paymentMethod()))
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        if (payment.getAmount() == null) {
            throw new BadRequestException("Payment amount is required because no accepted quote amount was found");
        }

        return appMapper.toPaymentResponse(paymentRepository.save(payment));
    }

    @Override
    public RequestDto.PaymentResponse pay(Long paymentId, RequestDto.PaymentActionRequest request) {
        Account customer = authContext.getCurrentAccount();
        Payment payment = paymentRepository.findByIdAndCustomerId(paymentId, customer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));
        if (!payment.getRequest().getCustomer().getId().equals(customer.getId())) {
            throw new ForbiddenException("You can only pay your own request");
        }

        PaymentStatus paymentStatus = parsePaymentStatus(request.paymentStatus());
        if (!(paymentStatus == PaymentStatus.PAID || paymentStatus == PaymentStatus.FAILED)) {
            throw new BadRequestException("Payment endpoint only supports PAID or FAILED");
        }

        payment.setPaymentStatus(paymentStatus);
        payment.setPaidAt(paymentStatus == PaymentStatus.PAID ? LocalDateTime.now() : null);
        return appMapper.toPaymentResponse(paymentRepository.save(payment));
    }

    private RescueRequest findRequest(Long requestId) {
        return rescueRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Rescue request not found with id: " + requestId));
    }

    private PaymentMethod parsePaymentMethod(String value) {
        try {
            return PaymentMethod.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid payment method: " + value);
        }
    }

    private PaymentStatus parsePaymentStatus(String value) {
        try {
            return PaymentStatus.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid payment status: " + value);
        }
    }

    private java.math.BigDecimal resolveQuoteAmount(Quote acceptedQuote) {
        if (acceptedQuote == null) {
            return null;
        }
        return acceptedQuote.getFinalAmount() != null ? acceptedQuote.getFinalAmount() : acceptedQuote.getEstimatedAmount();
    }
}
