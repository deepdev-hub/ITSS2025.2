package com.itss.vbas.repository;

import java.util.List;

import com.itss.vbas.entity.PricingRule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PricingRuleRepository extends JpaRepository<PricingRule, Long> {
    List<PricingRule> findByCompanyIdOrderByDistanceFromKmAsc(Long companyId);
}
