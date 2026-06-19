package com.itss.vbas.service.impl;

import java.security.SecureRandom;
import java.time.LocalDate;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final int OTP_BOUND = 1_000_000;
    private static final int MAX_OTP_ATTEMPTS = 5;
    private static final int MINIMUM_CUSTOMER_AGE = 18;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

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
    private final long passwordResetExpirationMinutes;

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
            FileStorageService fileStorageService,
            @Value("${app.password-reset.expiration-minutes:15}") long passwordResetExpirationMinutes
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
        this.passwordResetExpirationMinutes = passwordResetExpirationMinutes;
    }

    @Override
    public AuthDto.AuthResponse registerCustomer(AuthDto.RegisterRequest request) {
        if (accountRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("Email is already in use");
        }
        validateAdultDateOfBirth(request.dateOfBirth());
        String normalizedCccd = normalizeRequiredCccd(request.cccd());
        if (accountRepository.existsByCccd(normalizedCccd)) {
            throw new BadRequestException("CCCD is already in use");
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
                .cccd(normalizedCccd)
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
        String normalizedCccd = normalizeRequiredCccd(request.cccd());
        if (accountRepository.existsByCccdAndIdNot(normalizedCccd, account.getId())) {
            throw new BadRequestException("CCCD is already in use");
        }
        account.setFullName(request.fullName());
        account.setPhone(request.phone());
        account.setAvatarUrl(request.avatarUrl());
        account.setDateOfBirth(request.dateOfBirth());
        account.setGender(request.gender());
        account.setCccd(normalizedCccd);
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
    public AuthDto.PasswordResetResponse forgotPassword(AuthDto.PasswordResetRequest request) {
        Account account = accountRepository.findByEmailIgnoreCase(request.email().trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Email does not exist"));

        LocalDateTime now = LocalDateTime.now();
        invalidateActiveResetTokens(account, now);

        String otp = generateOtp();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(account)
                .token(UUID.randomUUID().toString())
                .otpHash(PasswordUtil.hash(otp))
                .expiresAt(LocalDateTime.now().plusMinutes(passwordResetExpirationMinutes))
                .attemptCount(0)
                .build();

        passwordResetTokenRepository.save(resetToken);
        boolean emailSent = emailService.sendResetPasswordOtp(account.getEmail(), otp, passwordResetExpirationMinutes);
        if (!emailSent) {
            resetToken.setUsedAt(LocalDateTime.now());
            passwordResetTokenRepository.save(resetToken);
            throw new BadRequestException("Could not send reset password OTP email. Please contact support or try again later.");
        }
        return new AuthDto.PasswordResetResponse(true, passwordResetExpirationMinutes);
    }

    @Override
    @Transactional(noRollbackFor = BadRequestException.class)
    public AuthDto.PasswordResetVerificationResponse verifyResetOtp(AuthDto.VerifyPasswordResetOtpRequest request) {
        Account account = accountRepository.findByEmailIgnoreCase(request.email().trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Email does not exist"));

        PasswordResetToken resetToken = passwordResetTokenRepository.findFirstByUserIdAndUsedAtIsNullOrderByIdDesc(account.getId())
                .orElseThrow(() -> new BadRequestException("No active password reset OTP was found"));

        validateResetTokenUsable(resetToken);

        int attemptCount = resetToken.getAttemptCount() == null ? 0 : resetToken.getAttemptCount();
        if (attemptCount >= MAX_OTP_ATTEMPTS) {
            resetToken.setUsedAt(LocalDateTime.now());
            passwordResetTokenRepository.save(resetToken);
            throw new BadRequestException("OTP attempt limit exceeded. Please request a new OTP.");
        }

        if (resetToken.getOtpHash() == null || !PasswordUtil.matches(request.otp(), resetToken.getOtpHash())) {
            int newAttemptCount = attemptCount + 1;
            resetToken.setAttemptCount(newAttemptCount);
            if (newAttemptCount >= MAX_OTP_ATTEMPTS) {
                resetToken.setUsedAt(LocalDateTime.now());
                passwordResetTokenRepository.save(resetToken);
                throw new BadRequestException("OTP attempt limit exceeded. Please request a new OTP.");
            }
            passwordResetTokenRepository.save(resetToken);
            throw new BadRequestException("Invalid OTP");
        }

        resetToken.setVerifiedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);
        return new AuthDto.PasswordResetVerificationResponse(resetToken.getToken());
    }

    @Override
    public void resetPassword(AuthDto.ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.resetToken().trim())
                .orElseThrow(() -> new BadRequestException("Invalid reset token"));

        validateResetTokenUsable(resetToken);
        if (resetToken.getVerifiedAt() == null) {
            throw new BadRequestException("OTP has not been verified");
        }

        Account account = resetToken.getUser();
        account.setPasswordHash(PasswordUtil.hash(request.newPassword()));
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

    private void invalidateActiveResetTokens(Account account, LocalDateTime usedAt) {
        List<PasswordResetToken> activeTokens = passwordResetTokenRepository.findByUserIdAndUsedAtIsNull(account.getId());
        activeTokens.forEach(token -> token.setUsedAt(usedAt));
        passwordResetTokenRepository.saveAll(activeTokens);
    }

    private void validateResetTokenUsable(PasswordResetToken resetToken) {
        if (resetToken.getUsedAt() != null) {
            throw new BadRequestException("Reset token has already been used");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired");
        }
    }

    private String generateOtp() {
        return String.format("%06d", SECURE_RANDOM.nextInt(OTP_BOUND));
    }

    private void validateAdultDateOfBirth(LocalDate dateOfBirth) {
        if (dateOfBirth == null || dateOfBirth.isAfter(LocalDate.now().minusYears(MINIMUM_CUSTOMER_AGE))) {
            throw new BadRequestException("dateOfBirth: must be at least 18 years old");
        }
    }

    private String normalizeRequiredCccd(String cccd) {
        String normalized = cccd == null ? "" : cccd.trim();
        if (normalized.isEmpty()) {
            throw new BadRequestException("CCCD is required");
        }
        return normalized;
    }
}
