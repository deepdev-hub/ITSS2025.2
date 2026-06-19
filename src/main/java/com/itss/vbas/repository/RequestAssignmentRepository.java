package com.itss.vbas.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.enums.AssignmentStatus;
import com.itss.vbas.enums.RescueRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RequestAssignmentRepository extends JpaRepository<RequestAssignment, Long> {
    List<RequestAssignment> findByRequestId(Long requestId);

    List<RequestAssignment> findByRequestIdOrderByAssignedAtDesc(Long requestId);

    Optional<RequestAssignment> findFirstByRequestIdOrderByAssignedAtDesc(Long requestId);

    Optional<RequestAssignment> findFirstByRequestIdAndCompanyIdOrderByAssignedAtDesc(Long requestId, Long companyId);

    Optional<RequestAssignment> findFirstByRequestIdAndStaffIdOrderByAssignedAtDesc(Long requestId, Long staffId);

    Optional<RequestAssignment> findFirstByRequestIdAndStatusOrderByAssignedAtDesc(Long requestId, AssignmentStatus status);

    List<RequestAssignment> findByRequestIdAndStatus(Long requestId, AssignmentStatus status);

    List<RequestAssignment> findByStatusOrderByAssignedAtAsc(AssignmentStatus status);

    List<RequestAssignment> findByStaffIdOrderByAssignedAtDesc(Long staffId);

    boolean existsByRequestIdAndStatus(Long requestId, AssignmentStatus status);

    boolean existsByStaffIdAndStatusIn(Long staffId, Collection<AssignmentStatus> statuses);

    long countByCompanyId(Long companyId);

    long countByStaffId(Long staffId);

    long countByStaffIdAndStatus(Long staffId, AssignmentStatus status);

    @Query("""
            select count(distinct a.request.id)
            from RequestAssignment a
            where a.company.id = :companyId
              and a.request.status = :status
              and a.request.updatedAt >= :startAt
              and a.request.updatedAt < :endAt
            """)
    long countDistinctRequestsByCompanyIdAndRequestStatus(
            @Param("companyId") Long companyId,
            @Param("status") RescueRequestStatus status,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt
    );
}
