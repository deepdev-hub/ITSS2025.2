package com.itss.vbas.config;

import com.itss.vbas.enums.RequestPriority;
import org.springframework.stereotype.Component;

import java.time.Duration;

//Cấu hình thời gian timeout cho từng mức độ ưu tiên của yêu cầu cứu hộ.

@Component
public class AssignmentTimeoutConfig {

    public Duration getTimeout(RequestPriority priority) {
        return switch (priority) {
            case LOW       -> Duration.ofMinutes(15);
            case NORMAL    -> Duration.ofMinutes(10);
            case HIGH      -> Duration.ofMinutes(7);
            case EMERGENCY -> Duration.ofMinutes(3);
        };
    }

    public long getTimeoutSeconds(RequestPriority priority) {
        return getTimeout(priority).toSeconds();
    }
}