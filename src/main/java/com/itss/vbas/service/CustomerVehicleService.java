package com.itss.vbas.service;

import java.util.List;

import com.itss.vbas.dto.customer.CustomerDto;

public interface CustomerVehicleService {
    List<CustomerDto.VehicleResponse> getMyVehicles();

    CustomerDto.VehicleResponse getVehicle(Long id);

    CustomerDto.VehicleResponse createVehicle(CustomerDto.VehicleRequest request);

    CustomerDto.VehicleResponse updateVehicle(Long id, CustomerDto.VehicleRequest request);

    void deleteVehicle(Long id);
}
