package com.itss.vbas.service.impl;

import java.math.BigDecimal;
import java.util.Map;

import com.itss.vbas.dto.location.LocationDto;
import com.itss.vbas.exception.BadRequestException;
import com.itss.vbas.service.GeocodingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class GeocodingServiceImpl implements GeocodingService {

    private static final Logger log = LoggerFactory.getLogger(GeocodingServiceImpl.class);
    private static final String NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/reverse";
    private static final String USER_AGENT = "VBAS-App/1.0 (vehicle-breakdown-assistance)";

    private final RestTemplate restTemplate;

    public GeocodingServiceImpl() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public LocationDto.ReverseGeocodeResponse reverseGeocode(BigDecimal lat, BigDecimal lng) {
        String url = UriComponentsBuilder.fromHttpUrl(NOMINATIM_BASE_URL)
                .queryParam("format", "jsonv2")
                .queryParam("lat", lat.toPlainString())
                .queryParam("lon", lng.toPlainString())
                .queryParam("accept-language", "vi,en")
                .queryParam("addressdetails", "1")
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", USER_AGENT);
        headers.set("Accept-Language", "vi,en");

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);

            Map<?, ?> body = response.getBody();
            if (body == null) {
                throw new BadRequestException("No geocoding result found for the given coordinates");
            }
            return mapNominatimResponse(body, lat, lng);

        } catch (RestClientException ex) {
            log.error("Failed to call Nominatim for lat={}, lng={}: {}", lat, lng, ex.getMessage());
            throw new BadRequestException("Reverse geocoding service is temporarily unavailable. Please try again later.");
        }
    }

    @SuppressWarnings("unchecked")
    private LocationDto.ReverseGeocodeResponse mapNominatimResponse(Map<?, ?> body, BigDecimal lat, BigDecimal lng) {
        if (body.get("error") != null) {
            throw new BadRequestException("No address found for the given coordinates");
        }

        Map<String, String> address = (Map<String, String>) body.get("address");
        String displayName = (String) body.get("display_name");

        if (address == null) {
            throw new BadRequestException("No address data returned for the given coordinates");
        }

        String country = resolveCountry(address);
        String province = resolveProvince(address);
        String district = resolveDistrict(address);
        String ward = resolveWard(address);
        String street = resolveStreet(address);
        String detail = displayName != null ? displayName : buildFallbackDetail(country, province, district, ward, street);

        return new LocationDto.ReverseGeocodeResponse(country, province, district, ward, street, detail, lat, lng);
    }

    private String resolveCountry(Map<String, String> address) {
        String country = address.get("country");
        if (country == null) return "";
        if ("Việt Nam".equalsIgnoreCase(country) || "Viet Nam".equalsIgnoreCase(country)
                || "Vietnam".equalsIgnoreCase(country)) {
            return "Vietnam";
        }
        return country;
    }

    private String resolveProvince(Map<String, String> address) {
        String v = firstNonBlank(address.get("state"), address.get("city"),
                address.get("province"), address.get("region"));
        return v != null ? v : "";
    }

    private String resolveDistrict(Map<String, String> address) {
        String v = firstNonBlank(address.get("county"), address.get("city_district"),
                address.get("borough"), address.get("municipality"));
        return v != null ? v : "";
    }

    private String resolveWard(Map<String, String> address) {
        String v = firstNonBlank(address.get("suburb"), address.get("quarter"),
                address.get("neighbourhood"), address.get("village"), address.get("town"));
        return v != null ? v : "";
    }

    private String resolveStreet(Map<String, String> address) {
        String v = firstNonBlank(address.get("road"), address.get("street"),
                address.get("pedestrian"), address.get("footway"), address.get("path"));
        return v != null ? v : "";
    }

    private String buildFallbackDetail(String country, String province, String district, String ward, String street) {
        StringBuilder sb = new StringBuilder();
        for (String part : new String[]{street, ward, district, province, country}) {
            if (part != null && !part.isBlank()) {
                if (sb.length() > 0) sb.append(", ");
                sb.append(part);
            }
        }
        return sb.toString();
    }

    private String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) return v;
        }
        return null;
    }
}