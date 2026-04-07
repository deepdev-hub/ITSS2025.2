package com.itss.vbas.repository;

import java.util.List;
import java.util.Optional;

import com.itss.vbas.entity.CustomerVehicle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerVehicleRepository extends JpaRepository<CustomerVehicle, Long> {
    List<CustomerVehicle> findByCustomerIdOrderByIdDesc(Long customerId);

    Optional<CustomerVehicle> findByIdAndCustomerId(Long id, Long customerId);

    boolean existsByPlateNumberIgnoreCase(String plateNumber);
}
