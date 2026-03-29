package com.vehicleassistance.vehicle.breakdown.assistance.Controller;


import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vehicleassistance.vehicle.breakdown.assistance.DTO.AppUserRequest;
import com.vehicleassistance.vehicle.breakdown.assistance.Entity.AppUsers;
import com.vehicleassistance.vehicle.breakdown.assistance.Service.AppUserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AppUserController {


    private final AppUserService appUserService;

    @GetMapping
    public List<AppUsers> getAllUsers() {
        return appUserService.getAllUsers();
    }

    @GetMapping("/{id}")
    public AppUsers getUserById(@PathVariable Long id) {
        return appUserService.getUserById(id);
    }

    @PostMapping
    public ResponseEntity<AppUsers> createUser(@RequestBody AppUserRequest request) {
        AppUsers createdUser = appUserService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @PutMapping("/{id}")
    public AppUsers updateUser(@PathVariable Long id, @RequestBody AppUserRequest request) {
        return appUserService.updateUser(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        appUserService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
