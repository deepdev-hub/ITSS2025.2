package com.itss.vbas.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;

import com.itss.vbas.dto.request.FeeDto;
import com.itss.vbas.entity.Address;
import com.itss.vbas.entity.RescueStaff;
import com.itss.vbas.entity.ServiceType;
import com.itss.vbas.enums.StaffStatus;
import com.itss.vbas.exception.BadRequestException;
import com.itss.vbas.exception.ResourceNotFoundException;
import com.itss.vbas.repository.RescueStaffRepository;
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

    @Value("${app.fee.base-travel-cost:10000}")
    private String baseTravelCostStr;

    @Value("${app.fee.travel-cost-per-km:10000}")
    private String travelCostPerKmStr;

    private final ServiceTypeRepository serviceTypeRepository;
    private final RescueStaffRepository rescueStaffRepository;

    public FeeServiceImpl(ServiceTypeRepository serviceTypeRepository, RescueStaffRepository rescueStaffRepository) {
        this.serviceTypeRepository = serviceTypeRepository;
        this.rescueStaffRepository = rescueStaffRepository;
    }

    @Override
    public FeeDto.PredictFeeResponse predictFee(Long serviceTypeId, BigDecimal latitude, BigDecimal longitude) {
        ServiceType serviceType = serviceTypeRepository.findByIdAndIsDeletedFalse(serviceTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Service type not found with id: " + serviceTypeId));

        BigDecimal coefficient = parseCoefficient();
        if (serviceType.getBasePrice() == null) {
            throw new BadRequestException("Selected service type is missing a service price");
        }
        BigDecimal basePrice = serviceType.getBasePrice();
        if (basePrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Selected service type has an invalid service price");
        }
        BigDecimal travelCost = estimateTravelCost(latitude, longitude);

        // formula: fee = coefficient * (basePrice + automaticTravelCost)
        BigDecimal estimatedFee = coefficient
                .multiply(basePrice.add(travelCost))
                .setScale(0, RoundingMode.HALF_UP);

        return new FeeDto.PredictFeeResponse(
                serviceType.getId(),
                serviceType.getServiceName(),
                basePrice,
                travelCost,
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

    private BigDecimal estimateTravelCost(BigDecimal requestLatitude, BigDecimal requestLongitude) {
        validateCoordinate(requestLatitude, -90, 90, "Latitude");
        validateCoordinate(requestLongitude, -180, 180, "Longitude");

        BigDecimal baseTravelCost = parseNonNegativeMoney(baseTravelCostStr, "Base travel cost");
        BigDecimal travelCostPerKm = parseNonNegativeMoney(travelCostPerKmStr, "Travel cost per km");
        Double nearestDistanceKm = findNearestActiveStaffDistanceKm(requestLatitude, requestLongitude);
        if (nearestDistanceKm == null) {
            return baseTravelCost.setScale(0, RoundingMode.HALF_UP);
        }

        return baseTravelCost
                .add(travelCostPerKm.multiply(BigDecimal.valueOf(nearestDistanceKm)))
                .setScale(0, RoundingMode.HALF_UP);
    }

    private Double findNearestActiveStaffDistanceKm(BigDecimal requestLatitude, BigDecimal requestLongitude) {
        double requestLat = requestLatitude.doubleValue();
        double requestLng = requestLongitude.doubleValue();
        Double nearestDistanceKm = null;

        for (RescueStaff staff : rescueStaffRepository.findAll()) {
            if (staff.getStatus() != StaffStatus.ACTIVE || staff.getUser() == null) {
                continue;
            }
            Address staffAddress = staff.getUser().getDefaultAddress();
            if (staffAddress == null || staffAddress.getLatitude() == null || staffAddress.getLongitude() == null) {
                continue;
            }
            double distanceKm = calculateDistanceKm(
                    requestLat,
                    requestLng,
                    staffAddress.getLatitude().doubleValue(),
                    staffAddress.getLongitude().doubleValue()
            );
            if (nearestDistanceKm == null || distanceKm < nearestDistanceKm) {
                nearestDistanceKm = distanceKm;
            }
        }

        return nearestDistanceKm;
    }

    private double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double earthRadiusKm = 6371.0;
        double deltaLat = Math.toRadians(lat2 - lat1);
        double deltaLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private void validateCoordinate(BigDecimal value, double min, double max, String label) {
        if (value == null) {
            throw new BadRequestException(label + " is required to estimate travel cost");
        }
        double coordinate = value.doubleValue();
        if (!Double.isFinite(coordinate) || coordinate < min || coordinate > max) {
            throw new BadRequestException(label + " is invalid");
        }
    }

    private BigDecimal parseNonNegativeMoney(String value, String label) {
        try {
            BigDecimal amount = new BigDecimal(value.trim());
            if (amount.compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException(label + " cannot be negative");
            }
            return amount;
        } catch (NumberFormatException ex) {
            throw new BadRequestException(label + " is invalid");
        }
    }
}
