package com.itss.vbas.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;

import com.itss.vbas.service.RouteService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

class OpenRouteServiceImplTest {

    @Test
    void requestsGeoJsonEndpointAndParsesGeoJsonResponse() {
        OpenRouteServiceImpl service = new OpenRouteServiceImpl(
                new RestTemplateBuilder(),
                "https://api.openrouteservice.org/v2",
                "test-key",
                java.time.Duration.ofSeconds(5),
                java.time.Duration.ofSeconds(10)
        );

        RestTemplate restTemplate = (RestTemplate) ReflectionTestUtils.getField(service, "restTemplate");
        MockRestServiceServer server = MockRestServiceServer.createServer(restTemplate);
        server.expect(requestTo("https://api.openrouteservice.org/v2/directions/driving-car/geojson"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("Authorization", "test-key"))
                .andExpect(content().json("""
                        {
                          "coordinates": [
                            [105.8500000, 21.0300000],
                            [105.8600000, 21.0400000]
                          ]
                        }
                        """))
                .andRespond(withSuccess("""
                        {
                          "features": [
                            {
                              "geometry": {
                                "coordinates": [
                                  [105.8500000, 21.0300000],
                                  [105.8550000, 21.0350000],
                                  [105.8600000, 21.0400000]
                                ]
                              },
                              "properties": {
                                "summary": {
                                  "distance": 3210.0,
                                  "duration": 480.0
                                }
                              }
                            }
                          ]
                        }
                        """, MediaType.APPLICATION_JSON));

        RouteService.RouteResult result = service.getDrivingRoute(
                BigDecimal.valueOf(21.03),
                BigDecimal.valueOf(105.85),
                BigDecimal.valueOf(21.04),
                BigDecimal.valueOf(105.86)
        );

        server.verify();
        assertThat(result).isNotNull();
        assertThat(result.points()).hasSize(3);
        assertThat(result.distanceKm()).isEqualTo(3.21d);
        assertThat(result.durationMinutes()).isEqualTo(8);
        assertThat(result.points().get(0).latitude()).isEqualByComparingTo("21.0300000");
        assertThat(result.points().get(0).longitude()).isEqualByComparingTo("105.8500000");
    }

    @Test
    void acceptsConfiguredDirectionsBaseUrlWithoutDuplicatingPath() {
        OpenRouteServiceImpl service = new OpenRouteServiceImpl(
                new RestTemplateBuilder(),
                "https://api.openrouteservice.org/v2/directions/driving-car",
                "test-key",
                java.time.Duration.ofSeconds(5),
                java.time.Duration.ofSeconds(10)
        );

        RestTemplate restTemplate = (RestTemplate) ReflectionTestUtils.getField(service, "restTemplate");
        MockRestServiceServer server = MockRestServiceServer.createServer(restTemplate);
        server.expect(requestTo("https://api.openrouteservice.org/v2/directions/driving-car/geojson"))
                .andRespond(withSuccess("""
                        {
                          "features": [
                            {
                              "geometry": {
                                "coordinates": [
                                  [105.8500000, 21.0300000],
                                  [105.8600000, 21.0400000]
                                ]
                              },
                              "properties": {
                                "summary": {
                                  "distance": 1000.0,
                                  "duration": 120.0
                                }
                              }
                            }
                          ]
                        }
                        """, new MediaType(MediaType.APPLICATION_JSON, StandardCharsets.UTF_8)));

        RouteService.RouteResult result = service.getDrivingRoute(
                BigDecimal.valueOf(21.03),
                BigDecimal.valueOf(105.85),
                BigDecimal.valueOf(21.04),
                BigDecimal.valueOf(105.86)
        );

        server.verify();
        assertThat(result).isNotNull();
        assertThat(result.points()).hasSize(2);
        assertThat(result.durationMinutes()).isEqualTo(2);
    }
}
