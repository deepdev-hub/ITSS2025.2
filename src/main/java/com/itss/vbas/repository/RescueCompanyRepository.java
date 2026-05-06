package com.itss.vbas.repository;

import java.util.Optional;

import com.itss.vbas.entity.RescueCompany;
import com.itss.vbas.enums.CompanyStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RescueCompanyRepository extends JpaRepository<RescueCompany, Long> {
    Optional<RescueCompany> findByOwnerAccountId(Long ownerAccountId);

    boolean existsByOwnerAccountId(Long ownerAccountId);

    long countByStatus(CompanyStatus status);
}
