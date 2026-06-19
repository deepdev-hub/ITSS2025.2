package com.itss.vbas.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.itss.vbas.config.DotEnvUtils;
import com.itss.vbas.service.RouteService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
public class OpenRouteServiceImpl implements RouteService {

    private static final Logger log = LoggerFactory.getLogger(OpenRouteServiceImpl.class);

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String apiKey;

    public OpenRouteServiceImpl(
            RestTemplateBuilder restTemplateBuilder,
            @Value("${app.ors.base-url:}") String baseUrl,
            @Value("${app.ors.api-key:}") String apiKey,
            @Value("${app.ors.connect-timeout:5s}") Duration connectTimeout,
            @Value("${app.ors.read-timeout:10s}") Duration readTimeout
    ) {
        Map<String, String> dotenv = DotEnvUtils.loadDotEnv();
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(connectTimeout)
                .setReadTimeout(readTimeout)
                .build();
        this.baseUrl = normalizeValue(DotEnvUtils.firstText(baseUrl, System.getenv("APP_ORS_BASE_URL"), dotenv.get("APP_ORS_BASE_URL"), "https://api.openrouteservice.org/v2"));
        this.apiKey = normalizeValue(DotEnvUtils.firstText(apiKey, System.getenv("OpenRouteService_KEY"), dotenv.get("OpenRouteService_KEY")));
    }

    @Override
    @SuppressWarnings("unchecked")
    public RouteResult getDrivingRoute(BigDecimal fromLatitude, BigDecimal fromLongitude, BigDecimal toLatitude, BigDecimal toLongitude) {
        if (baseUrl.isBlank() || apiKey.isBlank()) {
            log.warn("OpenRouteService is not configured. baseUrlBlank={}, apiKeyBlank={}", baseUrl.isBlank(), apiKey.isBlank());
            return null;
        }

        String url = buildDirectionsUrl();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", apiKey);

        Map<String, Object> payload = Map.of(
                "coordinates", List.of(
                        List.of(fromLongitude.doubleValue(), fromLatitude.doubleValue()),
                        List.of(toLongitude.doubleValue(), toLatitude.doubleValue())
                )
        );

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    new HttpEntity<>(payload, headers),
                    Map.class
            );

            Map<String, Object> body = response.getBody();
            if (body == null) {
                return null;
            }

            List<List<Number>> coordinates = extractCoordinates(body);
            if (coordinates == null || coordinates.size() < 2) {
                log.warn(
                        "OpenRouteService returned no usable route geometry from ({}, {}) to ({}, {})",
                        fromLatitude, fromLongitude, toLatitude, toLongitude
                );
                return null;
            }

            Map<String, Object> summary = extractSummary(body);

            List<RoutePoint> points = new ArrayList<>();
            for (List<Number> coordinate : coordinates) {
                if (coordinate == null || coordinate.size() < 2) {
                    continue;
                }
                BigDecimal longitude = BigDecimal.valueOf(coordinate.get(0).doubleValue()).setScale(7, RoundingMode.HALF_UP);
                BigDecimal latitude = BigDecimal.valueOf(coordinate.get(1).doubleValue()).setScale(7, RoundingMode.HALF_UP);
                points.add(new RoutePoint(latitude, longitude));
            }
            if (points.size() < 2) {
                log.warn(
                        "OpenRouteService route had fewer than 2 valid points from ({}, {}) to ({}, {})",
                        fromLatitude, fromLongitude, toLatitude, toLongitude
                );
                return null;
            }

            Double distanceKm = summary == null || summary.get("distance") == null
                    ? null
                    : ((Number) summary.get("distance")).doubleValue() / 1000d;
            Integer durationMinutes = summary == null || summary.get("duration") == null
                    ? null
                    : Math.max(1, (int) Math.round(((Number) summary.get("duration")).doubleValue() / 60d));

            return new RouteResult(points, distanceKm, durationMinutes);
        } catch (RestClientException ex) {
            log.warn(
                    "OpenRouteService request failed from ({}, {}) to ({}, {}): {}",
                    fromLatitude,
                    fromLongitude,
                    toLatitude,
                    toLongitude,
                    ex.getMessage()
            );
            return null;
        }
    }

    private String buildDirectionsUrl() {
        String normalizedBaseUrl = baseUrl.replaceAll("/+$", "");
        if (normalizedBaseUrl.endsWith("/geojson")
                || normalizedBaseUrl.endsWith("/json")
                || normalizedBaseUrl.endsWith("/gpx")) {
            return normalizedBaseUrl;
        }
        if (normalizedBaseUrl.endsWith("/directions/driving-car")) {
            return normalizedBaseUrl + "/geojson";
        }
        return normalizedBaseUrl + "/directions/driving-car/geojson";
    }

    @SuppressWarnings("unchecked")
    private List<List<Number>> extractCoordinates(Map<String, Object> body) {
        List<Map<String, Object>> features = (List<Map<String, Object>>) body.get("features");
        if (features != null && !features.isEmpty()) {
            Map<String, Object> feature = features.get(0);
            Map<String, Object> geometry = feature == null ? null : (Map<String, Object>) feature.get("geometry");
            List<List<Number>> coordinates = geometry == null ? null : (List<List<Number>>) geometry.get("coordinates");
            if (coordinates != null && coordinates.size() >= 2) {
                return coordinates;
            }
        }

        List<Map<String, Object>> routes = (List<Map<String, Object>>) body.get("routes");
        if (routes == null || routes.isEmpty()) {
            return null;
        }

        Object geometry = routes.get(0).get("geometry");
        if (geometry instanceof Map<?, ?> geometryMap) {
            Object coordinates = geometryMap.get("coordinates");
            if (coordinates instanceof List<?> coordinateList) {
                return (List<List<Number>>) coordinateList;
            }
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> extractSummary(Map<String, Object> body) {
        List<Map<String, Object>> features = (List<Map<String, Object>>) body.get("features");
        if (features != null && !features.isEmpty()) {
            Map<String, Object> properties = (Map<String, Object>) features.get(0).get("properties");
            Map<String, Object> summary = properties == null ? null : (Map<String, Object>) properties.get("summary");
            if (summary != null) {
                return summary;
            }
        }

        List<Map<String, Object>> routes = (List<Map<String, Object>>) body.get("routes");
        if (routes == null || routes.isEmpty()) {
            return null;
        }
        return (Map<String, Object>) routes.get(0).get("summary");
    }

    private String normalizeValue(String value) {
        return value == null ? "" : value.trim();
    }
}
