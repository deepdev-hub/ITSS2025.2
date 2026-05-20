package com.itss.vbas.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;

import com.itss.vbas.dto.request.FeeDto;
import com.itss.vbas.entity.ServiceType;
import com.itss.vbas.exception.BadRequestException;
import com.itss.vbas.exception.ResourceNotFoundException;
import com.itss.vbas.repository.ServiceTypeRepository;
import com.itss.vbas.service.FeeService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class FeeServiceImpl implements FeeService {

    // Inject as String to avoid type-conversion issues with @Value + BigDecimal
    @Value("${app.fee.coefficient:1.2}")
    private String coefficientStr;

    private final ServiceTypeRepository serviceTypeRepository;

    public FeeServiceImpl(ServiceTypeRepository serviceTypeRepository) {
        this.serviceTypeRepository = serviceTypeRepository;
    }

    @Override
    public FeeDto.PredictFeeResponse predictFee(Long serviceTypeId, BigDecimal transportCost) {
        ServiceType serviceType = serviceTypeRepository.findById(serviceTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Service type not found with id: " + serviceTypeId));

        BigDecimal coefficient = parseCoefficient();
        BigDecimal transport = (transportCost == null) ? BigDecimal.ZERO : transportCost;
        if (transport.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Travel cost cannot be negative");
        }
        if (serviceType.getBasePrice() == null) {
            throw new BadRequestException("Selected service type is missing a service price");
        }
        BigDecimal basePrice = serviceType.getBasePrice();
        if (basePrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Selected service type has an invalid service price");
        }

        // formula: fee = coefficient * (basePrice + transportCost)
        BigDecimal estimatedFee = coefficient
                .multiply(basePrice.add(transport))
                .setScale(0, RoundingMode.HALF_UP);

        return new FeeDto.PredictFeeResponse(
                serviceType.getId(),
                serviceType.getServiceName(),
                basePrice,
                transport,
                coefficient,
                estimatedFee
        );
    }

    private BigDecimal parseCoefficient() {
        try {
            BigDecimal coefficient = new BigDecimal(coefficientStr.trim());
            if (coefficient.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Fee coefficient must be greater than zero");
            }
            return coefficient;
        } catch (NumberFormatException ex) {
            throw new BadRequestException("Fee coefficient is invalid");
        }
    }
}
