package com.itss.vbas.repository;

import java.util.Optional;

import com.itss.vbas.entity.Account;
import com.itss.vbas.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByEmailIgnoreCase(String email);

    Optional<Account> findByEmailIgnoreCaseAndIsDeletedFalse(String email);

    Optional<Account> findByIdAndIsDeletedFalse(Long id);

    java.util.List<Account> findAllByIsDeletedFalse();

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByCccd(String cccd);

    boolean existsByCccdAndIdNot(String cccd, Long id);

    long countByRoleRoleName(RoleName roleName);

    long countByRoleRoleNameAndIsDeletedFalse(RoleName roleName);
}
