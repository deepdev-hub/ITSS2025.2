package com.itss.vbas.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import com.itss.vbas.entity.RescueStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RescueStaffRepository extends JpaRepository<RescueStaff, Long> {
    Optional<RescueStaff> findByUserId(Long userId);

    List<RescueStaff> findByCompanyIdOrderByIdDesc(Long companyId);

    Optional<RescueStaff> findByIdAndCompanyId(Long id, Long companyId);

    Optional<RescueStaff> findByVehicleId(Long vehicleId);

    Optional<RescueStaff> findByVehicleIdAndCompanyId(Long vehicleId, Long companyId);

    long countByCompanyId(Long companyId);

//Tim ktv dang ACTIVE va nam trong ban kinh
    @Query(value = "SELECT rs.* FROM rescue_staff rs " +
           "INNER JOIN account a ON rs.user_id = a.id " + 
           "INNER JOIN addresses ad ON a.default_address_id = ad.id " +
           "WHERE rs.status = 'ACTIVE' " +
           "AND ad.latitude IS NOT NULL " +
           "AND ad.longitude IS NOT NULL " +
           "AND (6371 * acos(cos(radians(:incidentLat)) * cos(radians(ad.latitude)) * " +
           "cos(radians(ad.longitude) - radians(:incidentLng)) + " +
           "sin(radians(:incidentLat)) * sin(radians(ad.latitude)))) <= :radiusInKm", 
           nativeQuery = true)
    List<RescueStaff> findNearbyActiveStaff(
            @Param("incidentLat") BigDecimal incidentLat, 
            @Param("incidentLng") BigDecimal incidentLng,
            @Param("radiusInKm") double radiusInKm
    );
}
