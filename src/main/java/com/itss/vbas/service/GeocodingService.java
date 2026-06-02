package com.itss.vbas.service;

import java.math.BigDecimal;
import com.itss.vbas.dto.location.LocationDto;

public interface GeocodingService {
    LocationDto.ReverseGeocodeResponse reverseGeocode(BigDecimal lat, BigDecimal lng);
}