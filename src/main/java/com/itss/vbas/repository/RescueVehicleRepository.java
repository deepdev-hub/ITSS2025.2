package com.itss.vbas.repository;

import java.util.List;
import java.util.Optional;

import com.itss.vbas.entity.RescueVehicle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RescueVehicleRepository extends JpaRepository<RescueVehicle, Long> {
    List<RescueVehicle> findByBranchCompanyIdOrderByIdDesc(Long companyId);

    Optional<RescueVehicle> findByIdAndBranchCompanyId(Long id, Long companyId);

    long countByBranchCompanyId(Long companyId);
}
