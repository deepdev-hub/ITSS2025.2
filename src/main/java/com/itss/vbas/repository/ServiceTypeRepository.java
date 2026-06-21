package com.itss.vbas.repository;

import java.util.List;

import com.itss.vbas.entity.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceTypeRepository extends JpaRepository<ServiceType, Long> {
    List<ServiceType> findAllByOrderByServiceNameAsc();

    List<ServiceType> findAllByIsDeletedFalseOrderByServiceNameAsc();

    java.util.Optional<ServiceType> findByIdAndIsDeletedFalse(Long id);
}
