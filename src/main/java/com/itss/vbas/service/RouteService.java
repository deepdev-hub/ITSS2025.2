package com.itss.vbas.service;

import java.math.BigDecimal;
import java.util.List;

public interface RouteService {

    RouteResult getDrivingRoute(BigDecimal fromLatitude, BigDecimal fromLongitude, BigDecimal toLatitude, BigDecimal toLongitude);

    record RoutePoint(BigDecimal latitude, BigDecimal longitude) {
    }

    record RouteResult(List<RoutePoint> points, Double distanceKm, Integer durationMinutes) {
    }
}
