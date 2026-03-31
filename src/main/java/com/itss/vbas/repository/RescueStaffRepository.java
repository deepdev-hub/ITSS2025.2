package com.itss.vbas.repository;

import java.util.List;
import java.util.Optional;

import com.itss.vbas.entity.RescueStaff;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RescueStaffRepository extends JpaRepository<RescueStaff, Long> {
    Optional<RescueStaff> findByUserId(Long userId);

    List<RescueStaff> findByCompanyIdOrderByIdDesc(Long companyId);

    Optional<RescueStaff> findByIdAndCompanyId(Long id, Long companyId);

    long countByCompanyId(Long companyId);
}
