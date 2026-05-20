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
import com.itss.vbas.enums.QuoteStatus;
import com.itss.vbas.enums.RescueRequestStatus;
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
        RescueRequest rescueRequest = findRequest(requestId);
        requestSupportService.assertRequestParticipant(authContext.getCurrentAccount(), rescueRequest);
        return paymentRepository.findByRequestIdOrderByIdDesc(requestId)
                .stream()
                .map(appMapper::toPaymentResponse)
                .toList();
    }

    @Override
    public RequestDto.PaymentResponse createPayment(Long requestId, RequestDto.PaymentCreateRequest request) {
        RescueRequest rescueRequest = findRequest(requestId);
        requireCurrentCustomer(rescueRequest);
        ensureRequestCanCreatePayment(rescueRequest);

        Payment existingPayment = paymentRepository.findFirstByRequestIdOrderByIdDesc(requestId).orElse(null);
        if (existingPayment != null && existingPayment.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("This request has already been paid");
        }
        if (existingPayment != null && existingPayment.getPaymentStatus() == PaymentStatus.PENDING) {
            return appMapper.toPaymentResponse(existingPayment);
        }

        Quote acceptedQuote = quoteRepository.findByRequestIdOrderByCreatedAtDesc(requestId)
                .stream()
                .filter(quote -> quote.getStatus() == QuoteStatus.ACCEPTED)
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Customer must accept the deal price before payment"));
        java.math.BigDecimal paymentAmount = resolveQuoteAmount(acceptedQuote);
        if (paymentAmount == null || paymentAmount.compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Accepted deal price must be greater than zero");
        }

        Payment payment = Payment.builder()
                .request(rescueRequest)
                .customer(rescueRequest.getCustomer())
                .amount(paymentAmount)
                .paymentMethod(parsePaymentMethod(request.paymentMethod()))
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        return appMapper.toPaymentResponse(paymentRepository.save(payment));
    }

    @Override
    public RequestDto.PaymentResponse pay(Long paymentId, RequestDto.PaymentActionRequest request) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));
        requireCurrentCustomer(payment.getRequest());
        if (payment.getRequest().getStatus() == RescueRequestStatus.CANCELED) {
            throw new BadRequestException("Canceled request cannot be paid");
        }
        if (paymentRepository.existsByRequestIdAndPaymentStatus(payment.getRequest().getId(), PaymentStatus.PAID)
                && payment.getPaymentStatus() != PaymentStatus.PAID) {
            throw new BadRequestException("This request has already been paid");
        }

        PaymentStatus paymentStatus = parsePaymentStatus(request.paymentStatus());
        if (!(paymentStatus == PaymentStatus.PAID || paymentStatus == PaymentStatus.FAILED)) {
            throw new BadRequestException("Payment endpoint only supports PAID or FAILED");
        }
        if (payment.getPaymentStatus() == PaymentStatus.PAID) {
            if (paymentStatus == PaymentStatus.PAID) {
                return appMapper.toPaymentResponse(payment);
            }
            throw new BadRequestException("Paid payment cannot be changed");
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

    private void ensureRequestCanCreatePayment(RescueRequest rescueRequest) {
        if (rescueRequest.getStatus() == RescueRequestStatus.CANCELED) {
            throw new BadRequestException("Canceled request cannot be paid");
        }
        if (paymentRepository.existsByRequestIdAndPaymentStatus(rescueRequest.getId(), PaymentStatus.PAID)) {
            throw new BadRequestException("This request has already been paid");
        }
    }

    private Account requireCurrentCustomer(RescueRequest rescueRequest) {
        Account account = authContext.getCurrentAccount();
        if (!rescueRequest.getCustomer().getId().equals(account.getId())) {
            throw new ForbiddenException("You can only pay for your own request");
        }
        return account;
    }
}
