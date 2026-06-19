package com.itss.vbas.config;

import java.time.Duration;

import com.itss.vbas.enums.RequestPriority;
import org.springframework.stereotype.Component;

@Component
public class AssignmentTimeoutConfig {

    private static final Duration DEFAULT_TIMEOUT = Duration.ofSeconds(60);

    public Duration getTimeout(RequestPriority priority) {
        return DEFAULT_TIMEOUT;
    }
}
