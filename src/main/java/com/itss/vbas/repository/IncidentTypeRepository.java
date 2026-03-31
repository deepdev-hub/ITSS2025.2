package com.itss.vbas.repository;

import java.util.List;

import com.itss.vbas.entity.IncidentType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentTypeRepository extends JpaRepository<IncidentType, Long> {
    List<IncidentType> findAllByOrderByIncidentNameAsc();
}
