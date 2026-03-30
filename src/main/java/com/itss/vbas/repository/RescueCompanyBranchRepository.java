package com.itss.vbas.repository;

import java.util.List;
import java.util.Optional;

import com.itss.vbas.entity.RescueCompanyBranch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RescueCompanyBranchRepository extends JpaRepository<RescueCompanyBranch, Long> {
    List<RescueCompanyBranch> findByCompanyIdOrderByIdDesc(Long companyId);

    Optional<RescueCompanyBranch> findByIdAndCompanyId(Long id, Long companyId);
}
