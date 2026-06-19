package com.itss.vbas.repository;

import java.util.List;

import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.enums.RescueRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RescueRequestRepository extends JpaRepository<RescueRequest, Long> {
    List<RescueRequest> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<RescueRequest> findByStatus(RescueRequestStatus status);

    long countByStatus(RescueRequestStatus status);

    @Query("""
            select distinct r
            from RescueRequest r
            join RequestAssignment a on a.request.id = r.id
            where a.company.id = :companyId
            and a.status <> com.itss.vbas.enums.AssignmentStatus.PENDING
            order by r.createdAt desc
            """)
    List<RescueRequest> findAssignedRequestsByCompanyId(@Param("companyId") Long companyId);

    @Query("""
            select distinct r
            from RescueRequest r
            join RequestAssignment a on a.request.id = r.id
            where a.staff.id = :staffId
            order by r.createdAt desc
            """)
    List<RescueRequest> findAssignedRequestsByStaffId(@Param("staffId") Long staffId);
}
