package com.itss.vbas.service.impl;

import java.util.List;

import com.itss.vbas.dto.customer.CustomerDto;
import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.CustomerVehicle;
import com.itss.vbas.exception.BadRequestException;
import com.itss.vbas.exception.ResourceNotFoundException;
import com.itss.vbas.mapper.AppMapper;
import com.itss.vbas.repository.CustomerVehicleRepository;
import com.itss.vbas.security.AuthContext;
import com.itss.vbas.service.CustomerVehicleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CustomerVehicleServiceImpl implements CustomerVehicleService {

    private final CustomerVehicleRepository customerVehicleRepository;
    private final AuthContext authContext;
    private final AppMapper appMapper;

    public CustomerVehicleServiceImpl(
            CustomerVehicleRepository customerVehicleRepository,
            AuthContext authContext,
            AppMapper appMapper
    ) {
        this.customerVehicleRepository = customerVehicleRepository;
        this.authContext = authContext;
        this.appMapper = appMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerDto.VehicleResponse> getMyVehicles() {
        Account account = authContext.getCurrentAccount();
        return customerVehicleRepository.findByCustomerIdOrderByIdDesc(account.getId())
                .stream()
                .map(appMapper::toVehicleResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDto.VehicleResponse getVehicle(Long id) {
        Account account = authContext.getCurrentAccount();
        CustomerVehicle vehicle = customerVehicleRepository.findByIdAndCustomerId(id, account.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        return appMapper.toVehicleResponse(vehicle);
    }

    @Override
    public CustomerDto.VehicleResponse createVehicle(CustomerDto.VehicleRequest request) {
        Account account = authContext.getCurrentAccount();
        ensurePlateAvailable(request.plateNumber(), null);
        CustomerVehicle vehicle = customerVehicleRepository.save(map(new CustomerVehicle(), account, request));
        return appMapper.toVehicleResponse(vehicle);
    }

    @Override
    public CustomerDto.VehicleResponse updateVehicle(Long id, CustomerDto.VehicleRequest request) {
        Account account = authContext.getCurrentAccount();
        CustomerVehicle vehicle = customerVehicleRepository.findByIdAndCustomerId(id, account.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        ensurePlateAvailable(request.plateNumber(), vehicle.getId());
        return appMapper.toVehicleResponse(customerVehicleRepository.save(map(vehicle, account, request)));
    }

    @Override
    public void deleteVehicle(Long id) {
        Account account = authContext.getCurrentAccount();
        CustomerVehicle vehicle = customerVehicleRepository.findByIdAndCustomerId(id, account.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        customerVehicleRepository.delete(vehicle);
    }

    private CustomerVehicle map(CustomerVehicle vehicle, Account account, CustomerDto.VehicleRequest request) {
        vehicle.setCustomer(account);
        vehicle.setBrand(request.brand());
        vehicle.setModel(request.model());
        vehicle.setPlateNumber(request.plateNumber());
        vehicle.setManufactureYear(request.manufactureYear());
        vehicle.setColor(request.color());
        vehicle.setFuelType(request.fuelType());
        vehicle.setNotes(request.notes());
        return vehicle;
    }

    private void ensurePlateAvailable(String plateNumber, Long currentId) {
        if (plateNumber == null || plateNumber.isBlank()) {
            return;
        }
        boolean exists = customerVehicleRepository.existsByPlateNumberIgnoreCase(plateNumber);
        if (exists && currentId == null) {
            throw new BadRequestException("Plate number is already registered");
        }
        if (exists && currentId != null) {
            CustomerVehicle another = customerVehicleRepository.findAll().stream()
                    .filter(item -> plateNumber.equalsIgnoreCase(item.getPlateNumber()))
                    .filter(item -> !item.getId().equals(currentId))
                    .findFirst()
                    .orElse(null);
            if (another != null) {
                throw new BadRequestException("Plate number is already registered");
            }
        }
    }
}
