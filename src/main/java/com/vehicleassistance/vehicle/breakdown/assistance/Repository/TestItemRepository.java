package com.vehicleassistance.vehicle.breakdown.assistance.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
  
import com.vehicleassistance.vehicle.breakdown.assistance.Entity.TestItem;
  
public interface TestItemRepository extends JpaRepository<TestItem, Long> {
}