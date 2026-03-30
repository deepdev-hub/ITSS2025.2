package com.itss.vbas.config;

import java.util.Arrays;

import com.itss.vbas.entity.Role;
import com.itss.vbas.enums.RoleName;
import com.itss.vbas.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedDefaultRoles(RoleRepository roleRepository) {
        return args -> Arrays.stream(RoleName.values())
                .forEach(roleName -> roleRepository.findByRoleName(roleName)
                        .orElseGet(() -> roleRepository.save(Role.builder().roleName(roleName).build())));
    }
}
