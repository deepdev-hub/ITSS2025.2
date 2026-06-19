package com.itss.vbas.config;

import java.time.Duration;

import com.itss.vbas.enums.RequestPriority;
import org.springframework.stereotype.Component;

@Component
public class AssignmentTimeoutConfig {

    public Duration getTimeout(RequestPriority priority) {
        return Duration.ofSeconds(15);
    }
}
