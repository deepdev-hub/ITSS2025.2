package com.itss.vbas.dto.location;

import java.math.BigDecimal;

public final class LocationDto {

    private LocationDto() {
    }

    public record ReverseGeocodeResponse(
            String country,
            String province,
            String district,
            String ward,
            String street,
            String detail,
            BigDecimal latitude,
            BigDecimal longitude
    ) {
    }
}