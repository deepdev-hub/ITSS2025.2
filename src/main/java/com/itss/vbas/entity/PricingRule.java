package com.itss.vbas.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pricing_rules")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private RescueCompany company;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "service_type_id", nullable = false)
    private ServiceType serviceType;

    @Column(name = "distance_from_km", nullable = false, precision = 10, scale = 2)
    private BigDecimal distanceFromKm;

    @Column(name = "distance_to_km", nullable = false, precision = 10, scale = 2)
    private BigDecimal distanceToKm;

    @Column(name = "price_per_km", nullable = false, precision = 15, scale = 2)
    private BigDecimal pricePerKm;

    @Column(name = "night_surcharge", precision = 15, scale = 2)
    private BigDecimal nightSurcharge;

    @Column(name = "holiday_surcharge", precision = 15, scale = 2)
    private BigDecimal holidaySurcharge;
}
