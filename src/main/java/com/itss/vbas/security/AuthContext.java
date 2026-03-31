package com.itss.vbas.security;

import com.itss.vbas.entity.Account;
import com.itss.vbas.enums.RoleName;
import com.itss.vbas.exception.UnauthorizedException;
import com.itss.vbas.repository.AccountRepository;
import org.springframework.stereotype.Component;

@Component
public class AuthContext {

    private final AccountRepository accountRepository;

    public AuthContext(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public CurrentUser getCurrentUser() {
        CurrentUser currentUser = CurrentUserHolder.get();
        if (currentUser == null) {
            throw new UnauthorizedException("Authentication is required");
        }
        return currentUser;
    }

    public Account getCurrentAccount() {
        CurrentUser currentUser = getCurrentUser();
        return accountRepository.findById(currentUser.id())
                .orElseThrow(() -> new UnauthorizedException("Account not found"));
    }

    public RoleName getCurrentRole() {
        return getCurrentUser().roleName();
    }
}
