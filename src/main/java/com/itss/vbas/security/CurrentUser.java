package com.itss.vbas.security;

import com.itss.vbas.enums.RoleName;

public record CurrentUser(
        Long id,
        String email,
        RoleName roleName
) {
}
