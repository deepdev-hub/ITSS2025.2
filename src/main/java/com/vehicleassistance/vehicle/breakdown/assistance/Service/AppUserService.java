package com.vehicleassistance.vehicle.breakdown.assistance.Service;


import java.util.List;

import org.springframework.stereotype.Service;

import com.vehicleassistance.vehicle.breakdown.assistance.DTO.AppUserRequest;
import com.vehicleassistance.vehicle.breakdown.assistance.Entity.AppUsers;
import com.vehicleassistance.vehicle.breakdown.assistance.Exception.ResourceNotFoundException;
import com.vehicleassistance.vehicle.breakdown.assistance.Repository.AppUserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppUserService {

    private final AppUserRepository appUserRepository;

    public List<AppUsers> getAllUsers() {
        return appUserRepository.findAll();
    }

    public AppUsers getUserById(Long id) {
        return appUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với id = " + id));
    }

    public AppUsers createUser(AppUserRequest request) {
        if (appUserRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã tồn tại: " + request.getEmail());
        }

        AppUsers user = AppUsers.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .build();

        return appUserRepository.save(user);
    }

    public AppUsers updateUser(Long id, AppUserRequest request) {
        AppUsers existingUser = getUserById(id);

        boolean emailChanged = !existingUser.getEmail().equals(request.getEmail());
        if (emailChanged && appUserRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã tồn tại: " + request.getEmail());
        }

        existingUser.setFullName(request.getFullName());
        existingUser.setEmail(request.getEmail());
        existingUser.setPhone(request.getPhone());

        return appUserRepository.save(existingUser);
    }

    public void deleteUser(Long id) {
        AppUsers existingUser = getUserById(id);
        appUserRepository.delete(existingUser);
    }
}

