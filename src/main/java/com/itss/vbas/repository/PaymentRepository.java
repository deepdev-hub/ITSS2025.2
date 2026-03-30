package com.itss.vbas.repository;

import java.util.List;
import java.util.Optional;

import com.itss.vbas.entity.Payment;
import com.itss.vbas.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByRequestIdOrderByIdDesc(Long requestId);

    Optional<Payment> findFirstByRequestIdOrderByIdDesc(Long requestId);

    Optional<Payment> findByIdAndCustomerId(Long id, Long customerId);

    long countByPaymentStatus(PaymentStatus paymentStatus);
}
