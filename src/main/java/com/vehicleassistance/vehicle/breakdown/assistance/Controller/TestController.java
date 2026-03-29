package com.vehicleassistance.vehicle.breakdown.assistance.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vehicleassistance.vehicle.breakdown.assistance.Entity.TestItem;
import com.vehicleassistance.vehicle.breakdown.assistance.Repository.TestItemRepository;

@RestController

public class TestController {
  
      private TestItemRepository repo;
  
      public void DbTestController(TestItemRepository repo) {
          this.repo = repo;
      }
  
      @GetMapping("/db-test")
      public String dbTest() {
          TestItem item = new TestItem("hello");
          repo.save(item);
          return "saved with id = " + item.getId();
      }
      @GetMapping("/api/home")
      public String home() {
          return "Backend OK";
      }
  }


