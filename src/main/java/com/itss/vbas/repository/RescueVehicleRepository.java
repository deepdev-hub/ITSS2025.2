package com.itss.vbas.repository;

import java.util.List;
import java.util.Optional;

import com.itss.vbas.entity.RescueVehicle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RescueVehicleRepository extends JpaRepository<RescueVehicle, Long> {
    List<RescueVehicle> findByCompanyIdOrderByIdDesc(Long companyId);

    Optional<RescueVehicle> findByIdAndCompanyId(Long id, Long companyId);

    long countByCompanyId(Long companyId);
}
