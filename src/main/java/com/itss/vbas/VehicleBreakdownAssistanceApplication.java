package com.itss.vbas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class VehicleBreakdownAssistanceApplication {

    public static void main(String[] args) {
        SpringApplication.run(VehicleBreakdownAssistanceApplication.class, args);
    }
}
