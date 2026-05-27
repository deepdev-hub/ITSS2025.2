package com.itss.vbas.controller;

import java.math.BigDecimal;

import com.itss.vbas.dto.common.CommonDto;
import com.itss.vbas.dto.location.LocationDto;
import com.itss.vbas.exception.BadRequestException;
import com.itss.vbas.service.GeocodingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/location")
public class LocationController {

    private final GeocodingService geocodingService;

    public LocationController(GeocodingService geocodingService) {
        this.geocodingService = geocodingService;
    }

    @GetMapping("/reverse-geocode")
    public ResponseEntity<CommonDto.ApiResponse<LocationDto.ReverseGeocodeResponse>> reverseGeocode(
            @RequestParam("lat") String latParam,
            @RequestParam("lng") String lngParam
    ) {
        BigDecimal lat = parseBigDecimal(latParam, "lat");
        BigDecimal lng = parseBigDecimal(lngParam, "lng");
        validateLatitude(lat);
        validateLongitude(lng);
        return ResponseEntity.ok(CommonDto.ApiResponse.success(
                "Reverse geocoding completed successfully",
                geocodingService.reverseGeocode(lat, lng)));
    }

    private BigDecimal parseBigDecimal(String value, String paramName) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("Parameter '" + paramName + "' is required");
        }
        try {
            return new BigDecimal(value.trim());
        } catch (NumberFormatException ex) {
            throw new BadRequestException("Parameter '" + paramName + "' must be a valid decimal number");
        }
    }

    private void validateLatitude(BigDecimal lat) {
        if (lat.compareTo(BigDecimal.valueOf(-90)) < 0 || lat.compareTo(BigDecimal.valueOf(90)) > 0) {
            throw new BadRequestException("Latitude must be between -90 and 90");
        }
    }

    private void validateLongitude(BigDecimal lng) {
        if (lng.compareTo(BigDecimal.valueOf(-180)) < 0 || lng.compareTo(BigDecimal.valueOf(180)) > 0) {
            throw new BadRequestException("Longitude must be between -180 and 180");
        }
    }
}