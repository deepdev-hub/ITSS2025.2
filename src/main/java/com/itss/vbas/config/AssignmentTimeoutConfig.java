package com.itss.vbas.config;

import java.time.Duration;

import com.itss.vbas.enums.RequestPriority;
import org.springframework.stereotype.Component;

@Component
public class AssignmentTimeoutConfig {

    public Duration getTimeout(RequestPriority priority) {
        return switch (priority) {
            case LOW -> Duration.ofMinutes(10);
            case NORMAL -> Duration.ofMinutes(7);
            case HIGH -> Duration.ofMinutes(5);
            case EMERGENCY -> Duration.ofMinutes(3);
        };
    }
}
