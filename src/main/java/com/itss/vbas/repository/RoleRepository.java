package com.itss.vbas.repository;

import java.util.Optional;

import com.itss.vbas.entity.Role;
import com.itss.vbas.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByRoleName(RoleName roleName);
}
