package com.itss.vbas.entity;

import com.itss.vbas.enums.RescueVehicleStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "rescue_vehicles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RescueVehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "branch_id", nullable = false)
    private RescueCompanyBranch branch;

    @Column(name = "vehicle_code", nullable = false, length = 100)
    private String vehicleCode;

    @Column(name = "vehicle_type", nullable = false, length = 100)
    private String vehicleType;

    @Column(name = "plate_number", nullable = false, length = 50)
    private String plateNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RescueVehicleStatus status;
}
