package com.itss.vbas.service;

import java.util.List;

import com.itss.vbas.dto.request.RequestDto;

public interface PaymentService {
    List<RequestDto.PaymentResponse> getPaymentsByRequest(Long requestId);

    RequestDto.PaymentResponse createPayment(Long requestId, RequestDto.PaymentCreateRequest request);

    RequestDto.PaymentResponse pay(Long paymentId, RequestDto.PaymentActionRequest request);
}
