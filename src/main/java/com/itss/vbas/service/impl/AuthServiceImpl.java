package com.itss.vbas.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.itss.vbas.dto.auth.AuthDto;
import com.itss.vbas.dto.common.CommonDto;
import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.PasswordResetToken;
import com.itss.vbas.entity.Role;
import com.itss.vbas.enums.AccountStatus;
import com.itss.vbas.enums.RoleName;
import com.itss.vbas.exception.BadRequestException;
import com.itss.vbas.exception.UnauthorizedException;
import com.itss.vbas.mapper.AppMapper;
import com.itss.vbas.repository.AccountRepository;
import com.itss.vbas.repository.IncidentTypeRepository;
import com.itss.vbas.repository.PasswordResetTokenRepository;
import com.itss.vbas.repository.RescueCompanyRepository;
import com.itss.vbas.repository.RescueStaffRepository;
import com.itss.vbas.repository.RoleRepository;
import com.itss.vbas.repository.ServiceTypeRepository;
import com.itss.vbas.security.AuthContext;
import com.itss.vbas.security.CurrentUser;
import com.itss.vbas.security.JwtUtil;
import com.itss.vbas.service.AddressService;
import com.itss.vbas.service.AuthService;
import com.itss.vbas.service.EmailService;
import com.itss.vbas.service.FileStorageService;
import com.itss.vbas.util.PasswordUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final IncidentTypeRepository incidentTypeRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final RescueCompanyRepository rescueCompanyRepository;
    private final RescueStaffRepository rescueStaffRepository;
    private final AddressService addressService;
    private final AppMapper appMapper;
    private final JwtUtil jwtUtil;
    private final AuthContext authContext;
    private final FileStorageService fileStorageService;

    public AuthServiceImpl(
            EmailService emailService,
            PasswordResetTokenRepository passwordResetTokenRepository,
            AccountRepository accountRepository,
            RoleRepository roleRepository,
            IncidentTypeRepository incidentTypeRepository,
            ServiceTypeRepository serviceTypeRepository,
            RescueCompanyRepository rescueCompanyRepository,
            RescueStaffRepository rescueStaffRepository,
            AddressService addressService,
            AppMapper appMapper,
            JwtUtil jwtUtil,
            AuthContext authContext,
            FileStorageService fileStorageService
    ) {
        this.emailService = emailService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.accountRepository = accountRepository;
        this.roleRepository = roleRepository;
        this.incidentTypeRepository = incidentTypeRepository;
        this.serviceTypeRepository = serviceTypeRepository;
        this.rescueCompanyRepository = rescueCompanyRepository;
        this.rescueStaffRepository = rescueStaffRepository;
        this.addressService = addressService;
        this.appMapper = appMapper;
        this.jwtUtil = jwtUtil;
        this.authContext = authContext;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public AuthDto.AuthResponse registerCustomer(AuthDto.RegisterRequest request) {
        if (accountRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("Email is already in use");
        }

        Account account = Account.builder()
                .email(request.email().trim().toLowerCase())
                .passwordHash(PasswordUtil.hash(request.password()))
                .fullName(request.fullName())
                .phone(request.phone())
                .status(AccountStatus.ACTIVE)
                .role(getOrCreateRole(RoleName.CUSTOMER))
                .dateOfBirth(request.dateOfBirth())
                .gender(request.gender())
                .cccd(request.cccd())
                .defaultAddress(
                        request.defaultAddress() != null
                                ? addressService.createAddress(request.defaultAddress())
                                : null
                )
                .build();

        Account savedAccount = accountRepository.save(account);
        return buildAuthResponse(savedAccount);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        Account account = accountRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!PasswordUtil.matches(request.password(), account.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new UnauthorizedException("Your account is not active");
        }

        return buildAuthResponse(account);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthDto.ProfileResponse getCurrentProfile() {
        Account account = authContext.getCurrentAccount();
        return appMapper.toProfileResponse(account, resolveCompanyId(account), resolveStaffId(account));
    }

    @Override
    public AuthDto.ProfileResponse updateProfile(AuthDto.UpdateProfileRequest request) {
        Account account = authContext.getCurrentAccount();
        account.setFullName(request.fullName());
        account.setPhone(request.phone());
        account.setAvatarUrl(request.avatarUrl());
        account.setDateOfBirth(request.dateOfBirth());
        account.setGender(request.gender());
        account.setCccd(request.cccd());
        if (request.defaultAddress() != null) {
            account.setDefaultAddress(account.getDefaultAddress() == null
                    ? addressService.createAddress(request.defaultAddress())
                    : addressService.updateAddress(account.getDefaultAddress(), request.defaultAddress()));
        }
        return appMapper.toProfileResponse(accountRepository.save(account), resolveCompanyId(account), resolveStaffId(account));
    }

    @Override
    public void changePassword(AuthDto.ChangePasswordRequest request) {
        Account account = authContext.getCurrentAccount();
        if (!PasswordUtil.matches(request.currentPassword(), account.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }
        account.setPasswordHash(PasswordUtil.hash(request.newPassword()));
        accountRepository.save(account);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommonDto.LookupResponse> getIncidentLookups() {
        return incidentTypeRepository.findAllByOrderByIncidentNameAsc()
                .stream()
                .map(appMapper::toLookupResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommonDto.LookupResponse> getServiceLookups() {
        return serviceTypeRepository.findAllByOrderByServiceNameAsc()
                .stream()
                .map(appMapper::toLookupResponse)
                .toList();
    }

    @Override
    public void forgotPassword(String email) {
        Account account = accountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadRequestException("Email does not exist"));

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(account)
                .token(UUID.randomUUID().toString())
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .build();

        passwordResetTokenRepository.save(resetToken);
        String link = "http://localhost:5173/reset-password?token=" + resetToken.getToken();
        emailService.sendResetPasswordEmail(account.getEmail(), link);
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid token"));

        if (resetToken.getUsedAt() != null) {
            throw new BadRequestException("Token has already been used");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Token has expired");
        }

        Account account = resetToken.getUser();
        account.setPasswordHash(PasswordUtil.hash(newPassword));
        accountRepository.save(account);

        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);
    }

    @Override
    public CommonDto.FileUploadResponse uploadAvatar(MultipartFile file) {
        Account account = authContext.getCurrentAccount();
        String imageUrl = fileStorageService.storeAvatar(file);
        account.setAvatarUrl(imageUrl);
        accountRepository.save(account);
        return new CommonDto.FileUploadResponse(imageUrl);
    }

    private AuthDto.AuthResponse buildAuthResponse(Account account) {
        Long companyId = resolveCompanyId(account);
        Long staffId = resolveStaffId(account);
        String token = jwtUtil.generateToken(new CurrentUser(account.getId(), account.getEmail(), account.getRole().getRoleName()));
        return new AuthDto.AuthResponse(token, appMapper.toProfileResponse(account, companyId, staffId));
    }

    private Long resolveCompanyId(Account account) {
        return rescueCompanyRepository.findByOwnerAccountId(account.getId())
                .map(company -> company.getId())
                .orElse(null);
    }

    private Long resolveStaffId(Account account) {
        return rescueStaffRepository.findByUserId(account.getId())
                .map(staff -> staff.getId())
                .orElse(null);
    }

    private Role getOrCreateRole(RoleName roleName) {
        return roleRepository.findByRoleName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().roleName(roleName).build()));
    }
}
