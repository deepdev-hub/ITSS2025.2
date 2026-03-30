package com.itss.vbas.controller;

import java.util.List;

import com.itss.vbas.dto.common.CommonDto;
import com.itss.vbas.dto.customer.CustomerDto;
import com.itss.vbas.enums.RoleName;
import com.itss.vbas.security.RequiredRoles;
import com.itss.vbas.service.CustomerVehicleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customers")
@RequiredRoles(RoleName.CUSTOMER)
public class CustomerController {

    private final CustomerVehicleService customerVehicleService;

    public CustomerController(CustomerVehicleService customerVehicleService) {
        this.customerVehicleService = customerVehicleService;
    }

    @GetMapping("/vehicles")
    public ResponseEntity<CommonDto.ApiResponse<List<CustomerDto.VehicleResponse>>> getVehicles() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Vehicles fetched successfully", customerVehicleService.getMyVehicles()));
    }

    @PostMapping("/vehicles")
    public ResponseEntity<CommonDto.ApiResponse<CustomerDto.VehicleResponse>> createVehicle(@Valid @RequestBody CustomerDto.VehicleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonDto.ApiResponse.success("Vehicle created successfully", customerVehicleService.createVehicle(request)));
    }

    @GetMapping("/vehicles/{id}")
    public ResponseEntity<CommonDto.ApiResponse<CustomerDto.VehicleResponse>> getVehicle(@PathVariable Long id) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Vehicle fetched successfully", customerVehicleService.getVehicle(id)));
    }

    @PutMapping("/vehicles/{id}")
    public ResponseEntity<CommonDto.ApiResponse<CustomerDto.VehicleResponse>> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody CustomerDto.VehicleRequest request
    ) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Vehicle updated successfully", customerVehicleService.updateVehicle(id, request)));
    }

    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<CommonDto.ApiResponse<Void>> deleteVehicle(@PathVariable Long id) {
        customerVehicleService.deleteVehicle(id);
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Vehicle deleted successfully"));
    }
}
