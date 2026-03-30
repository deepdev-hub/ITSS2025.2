package com.itss.vbas.repository;

import java.util.List;
import java.util.Optional;

import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.enums.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RequestAssignmentRepository extends JpaRepository<RequestAssignment, Long> {
    List<RequestAssignment> findByRequestIdOrderByAssignedAtDesc(Long requestId);

    Optional<RequestAssignment> findFirstByRequestIdOrderByAssignedAtDesc(Long requestId);

    Optional<RequestAssignment> findFirstByRequestIdAndCompanyIdOrderByAssignedAtDesc(Long requestId, Long companyId);

    List<RequestAssignment> findByStaffIdOrderByAssignedAtDesc(Long staffId);

    long countByCompanyId(Long companyId);

    long countByStaffId(Long staffId);

    long countByStaffIdAndStatus(Long staffId, AssignmentStatus status);
}
