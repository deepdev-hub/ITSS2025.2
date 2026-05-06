package com.itss.vbas.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "daily_statistics")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyStatistic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "stat_date", nullable = false, unique = true)
    private LocalDate statDate;

    @Column(name = "request_count", nullable = false)
    private Long requestCount;

    @Column(name = "completed_request_count", nullable = false)
    private Long completedRequestCount;

    @Column(name = "canceled_request_count", nullable = false)
    private Long canceledRequestCount;

    @Column(name = "in_progress_request_count", nullable = false)
    private Long inProgressRequestCount;

    @Column(name = "paid_payment_count", nullable = false)
    private Long paidPaymentCount;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal revenue;

    @Column(name = "review_count", nullable = false)
    private Long reviewCount;

    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating;

    @Column(name = "customer_count", nullable = false)
    private Long customerCount;

    @Column(name = "staff_count", nullable = false)
    private Long staffCount;

    @Column(name = "company_count", nullable = false)
    private Long companyCount;

    @Column(name = "approved_company_count", nullable = false)
    private Long approvedCompanyCount;

    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt;
}
