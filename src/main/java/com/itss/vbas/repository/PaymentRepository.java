package com.itss.vbas.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.itss.vbas.entity.Payment;
import com.itss.vbas.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByRequestIdOrderByIdDesc(Long requestId);

    Optional<Payment> findFirstByRequestIdOrderByIdDesc(Long requestId);

    Optional<Payment> findByIdAndCustomerId(Long id, Long customerId);

    boolean existsByRequestIdAndPaymentStatus(Long requestId, PaymentStatus paymentStatus);

    long countByPaymentStatus(PaymentStatus paymentStatus);

    @Query("""
            select coalesce(sum(p.amount), 0)
            from Payment p
            where p.paymentStatus = :paymentStatus
            """)
    BigDecimal sumAmountByPaymentStatus(@Param("paymentStatus") PaymentStatus paymentStatus);

    @Query("""
            select coalesce(sum(p.amount), 0)
            from Payment p
            where p.paymentStatus = :paymentStatus
              and p.paidAt >= :startAt
              and p.paidAt < :endAt
              and exists (
                  select 1
                  from Quote q
                  where q.request.id = p.request.id
                    and q.company.id = :companyId
                    and q.status = com.itss.vbas.enums.QuoteStatus.ACCEPTED
              )
            """)
    BigDecimal sumPaidRevenueByCompanyId(
            @Param("companyId") Long companyId,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt
    );

    @Query("""
            select count(p)
            from Payment p
            where p.paymentStatus = :paymentStatus
              and p.paidAt >= :startAt
              and p.paidAt < :endAt
              and exists (
                  select 1
                  from Quote q
                  where q.request.id = p.request.id
                    and q.company.id = :companyId
                    and q.status = com.itss.vbas.enums.QuoteStatus.ACCEPTED
              )
            """)
    long countPaidPaymentsByCompanyId(
            @Param("companyId") Long companyId,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt
    );
}
