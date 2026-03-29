package com.vehicleassistance.vehicle.breakdown.assistance.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.vehicleassistance.vehicle.breakdown.assistance.Entity.AppUsers;


public interface AppUserRepository extends JpaRepository<AppUsers, Long> {
    boolean existsByEmail(String email);
}
