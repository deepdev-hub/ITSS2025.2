package com.itss.vbas.service.impl;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import com.itss.vbas.dto.admin.AdminDto;
import com.itss.vbas.dto.common.CommonDto;
import com.itss.vbas.dto.company.CompanyDto;
import com.itss.vbas.dto.request.RequestDto;
import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.IncidentType;
import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.entity.RequestStatusHistory;
import com.itss.vbas.entity.RescueCompany;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.entity.RescueStaff;
import com.itss.vbas.entity.RescueVehicle;
import com.itss.vbas.entity.Role;
import com.itss.vbas.entity.ServiceType;
import com.itss.vbas.entity.Address;
import com.itss.vbas.enums.AccountStatus;
import com.itss.vbas.enums.AssignmentStatus;
import com.itss.vbas.enums.CompanyStatus;
import com.itss.vbas.enums.RescueRequestStatus;
import com.itss.vbas.enums.RescueVehicleStatus;
import com.itss.vbas.enums.RoleName;
import com.itss.vbas.enums.StaffStatus;
import com.itss.vbas.exception.BadRequestException;
import com.itss.vbas.exception.ResourceNotFoundException;
import com.itss.vbas.mapper.AppMapper;
import com.itss.vbas.repository.AccountRepository;
import com.itss.vbas.repository.IncidentTypeRepository;
import com.itss.vbas.repository.RequestAssignmentRepository;
import com.itss.vbas.repository.RequestStatusHistoryRepository;
import com.itss.vbas.repository.RescueCompanyRepository;
import com.itss.vbas.repository.RescueRequestRepository;
import com.itss.vbas.repository.RescueStaffRepository;
import com.itss.vbas.repository.RescueVehicleRepository;
import com.itss.vbas.repository.RoleRepository;
import com.itss.vbas.repository.ServiceTypeRepository;
import com.itss.vbas.security.AuthContext;
import com.itss.vbas.service.AddressService;
import com.itss.vbas.service.AdminService;
import com.itss.vbas.service.AssignmentTimeoutService;
import com.itss.vbas.service.NotificationService;
import com.itss.vbas.service.RequestSupportService;
import com.itss.vbas.util.PasswordUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    private static final int AUTO_DISPATCH_STAFF_LIMIT = 5;
    private static final int MINIMUM_ACCOUNT_AGE = 18;
    private static final double INITIAL_SEARCH_RADIUS_KM = 2.0;
    private static final double SEARCH_RADIUS_GROWTH_KM_PER_SECOND = 0.5;
    private static final List<AssignmentStatus> BUSY_ASSIGNMENT_STATUSES = List.of(
            AssignmentStatus.PENDING,
            AssignmentStatus.ACCEPTED
    );

    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final IncidentTypeRepository incidentTypeRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final RescueCompanyRepository rescueCompanyRepository;
    private final RescueRequestRepository rescueRequestRepository;
    private final RequestAssignmentRepository requestAssignmentRepository;
    private final AddressService addressService;
    private final RequestSupportService requestSupportService;
    private final AssignmentTimeoutService assignmentTimeoutService;
    private final NotificationService notificationService;
    private final AuthContext authContext;
    private final AppMapper appMapper;
    private final RescueStaffRepository rescueStaffRepository;
    private final RescueVehicleRepository rescueVehicleRepository;
    private final RequestStatusHistoryRepository requestStatusHistoryRepository;

    public AdminServiceImpl(
            AccountRepository accountRepository,
            RoleRepository roleRepository,
            IncidentTypeRepository incidentTypeRepository,
            ServiceTypeRepository serviceTypeRepository,
            RescueCompanyRepository rescueCompanyRepository,
            RescueStaffRepository rescueStaffRepository,
            RescueVehicleRepository rescueVehicleRepository,
            RescueRequestRepository rescueRequestRepository,
            RequestAssignmentRepository requestAssignmentRepository,
            RequestStatusHistoryRepository requestStatusHistoryRepository,
            AddressService addressService,
            RequestSupportService requestSupportService,
            AssignmentTimeoutService assignmentTimeoutService,
            NotificationService notificationService,
            AuthContext authContext,
            AppMapper appMapper
    ) {
        this.accountRepository = accountRepository;
        this.roleRepository = roleRepository;
        this.incidentTypeRepository = incidentTypeRepository;
        this.serviceTypeRepository = serviceTypeRepository;
        this.rescueCompanyRepository = rescueCompanyRepository;
        this.rescueStaffRepository = rescueStaffRepository;
        this.rescueVehicleRepository = rescueVehicleRepository;
        this.rescueRequestRepository = rescueRequestRepository;
        this.requestAssignmentRepository = requestAssignmentRepository;
        this.requestStatusHistoryRepository = requestStatusHistoryRepository;
        this.addressService = addressService;
        this.requestSupportService = requestSupportService;
        this.assignmentTimeoutService = assignmentTimeoutService;
        this.notificationService = notificationService;
        this.authContext = authContext;
        this.appMapper = appMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminDto.AccountResponse> getAccounts() {
        return accountRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Account::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(appMapper::toAdminAccountResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDto.AccountResponse getAccount(Long id) {
        return appMapper.toAdminAccountResponse(findAccount(id));
    }

    @Override
    public AdminDto.AccountResponse createAccount(AdminDto.AccountRequest request) {
        if (accountRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("Email is already in use");
        }
        validateAdultDateOfBirth(request.dateOfBirth());
        String normalizedCccd = normalizeRequiredCccd(request.cccd());
        if (accountRepository.existsByCccd(normalizedCccd)) {
            throw new BadRequestException("CCCD is already in use");
        }

        Role role = getOrCreateRole(parseRoleName(request.roleName()));
        Account account = Account.builder()
                .email(request.email().trim().toLowerCase())
                .passwordHash(PasswordUtil.hash(defaultIfBlank(request.password(), "Password@123")))
                .fullName(request.fullName())
                .phone(request.phone())
                .avatarUrl(request.avatarUrl())
                .status(parseAccountStatus(request.status()))
                .role(role)
                .dateOfBirth(request.dateOfBirth())
                .gender(request.gender())
                .cccd(normalizedCccd)
                .defaultAddress(addressService.createAddress(request.defaultAddress()))
                .build();

        return appMapper.toAdminAccountResponse(accountRepository.save(account));
    }

    @Override
    public AdminDto.AccountResponse updateAccount(Long id, AdminDto.AccountRequest request) {
        Account account = findAccount(id);
        if (!account.getEmail().equalsIgnoreCase(request.email()) && accountRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("Email is already in use");
        }
        validateAdultDateOfBirth(request.dateOfBirth());
        String normalizedCccd = normalizeRequiredCccd(request.cccd());
        if (accountRepository.existsByCccdAndIdNot(normalizedCccd, account.getId())) {
            throw new BadRequestException("CCCD is already in use");
        }

        account.setEmail(request.email().trim().toLowerCase());
        account.setFullName(request.fullName());
        account.setPhone(request.phone());
        account.setAvatarUrl(request.avatarUrl());
        account.setStatus(parseAccountStatus(request.status()));
        account.setRole(getOrCreateRole(parseRoleName(request.roleName())));
        account.setDateOfBirth(request.dateOfBirth());
        account.setGender(request.gender());
        account.setCccd(normalizedCccd);
        if (request.defaultAddress() != null) {
            account.setDefaultAddress(account.getDefaultAddress() == null
                    ? addressService.createAddress(request.defaultAddress())
                    : addressService.updateAddress(account.getDefaultAddress(), request.defaultAddress()));
        }
        if (request.password() != null && !request.password().isBlank()) {
            account.setPasswordHash(PasswordUtil.hash(request.password()));
        }
        return appMapper.toAdminAccountResponse(accountRepository.save(account));
    }

    @Override
    public void deleteAccount(Long id) {
        Account account = findAccount(id);
        account.setStatus(AccountStatus.INACTIVE);
        accountRepository.save(account);
    }

    @Override
    public AdminDto.AccountResponse blockAccount(Long id) {
        Account account = findAccount(id);
        if (account.getId().equals(authContext.getCurrentAccount().getId())) {
            throw new BadRequestException("You cannot block your own account");
        }
        account.setStatus(AccountStatus.BANNED);
        return appMapper.toAdminAccountResponse(accountRepository.save(account));
    }

    @Override
    public AdminDto.AccountResponse unblockAccount(Long id) {
        Account account = findAccount(id);
        account.setStatus(AccountStatus.ACTIVE);
        return appMapper.toAdminAccountResponse(accountRepository.save(account));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommonDto.RoleResponse> getRoles() {
        return roleRepository.findAll()
                .stream()
                .map(role -> new CommonDto.RoleResponse(role.getId(), role.getRoleName().name()))
                .toList();
    }

    @Override
    public CommonDto.RoleResponse createRole(AdminDto.RoleRequest request) {
        RoleName roleName = parseRoleName(request.roleName());
        if (roleRepository.findByRoleName(roleName).isPresent()) {
            throw new BadRequestException("Role already exists");
        }
        Role role = roleRepository.save(Role.builder().roleName(roleName).build());
        return new CommonDto.RoleResponse(role.getId(), role.getRoleName().name());
    }

    @Override
    public CommonDto.RoleResponse updateRole(Long id, AdminDto.RoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + id));
        RoleName newRoleName = parseRoleName(request.roleName());
        roleRepository.findByRoleName(newRoleName)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BadRequestException("Role already exists");
                });
        role.setRoleName(newRoleName);
        Role saved = roleRepository.save(role);
        return new CommonDto.RoleResponse(saved.getId(), saved.getRoleName().name());
    }

    @Override
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + id));
        if (accountRepository.countByRoleRoleName(role.getRoleName()) > 0) {
            throw new BadRequestException("Cannot delete a role that is already assigned to accounts");
        }
        roleRepository.delete(role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminDto.IncidentTypeResponse> getIncidentTypes() {
        return incidentTypeRepository.findAllByOrderByIncidentNameAsc()
                .stream()
                .map(appMapper::toIncidentTypeResponse)
                .toList();
    }

    @Override
    public AdminDto.IncidentTypeResponse createIncidentType(AdminDto.IncidentTypeRequest request) {
        IncidentType incidentType = IncidentType.builder()
                .incidentCode(request.incidentCode())
                .incidentName(request.incidentName())
                .description(request.description())
                .build();
        return appMapper.toIncidentTypeResponse(incidentTypeRepository.save(incidentType));
    }

    @Override
    public AdminDto.IncidentTypeResponse updateIncidentType(Long id, AdminDto.IncidentTypeRequest request) {
        IncidentType incidentType = incidentTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident type not found with id: " + id));
        incidentType.setIncidentCode(request.incidentCode());
        incidentType.setIncidentName(request.incidentName());
        incidentType.setDescription(request.description());
        return appMapper.toIncidentTypeResponse(incidentTypeRepository.save(incidentType));
    }

    @Override
    public void deleteIncidentType(Long id) {
        IncidentType incidentType = incidentTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident type not found with id: " + id));
        incidentTypeRepository.delete(incidentType);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminDto.ServiceTypeResponse> getServiceTypes() {
        return serviceTypeRepository.findAllByOrderByServiceNameAsc()
                .stream()
                .map(appMapper::toServiceTypeResponse)
                .toList();
    }

    @Override
    public AdminDto.ServiceTypeResponse createServiceType(AdminDto.ServiceTypeRequest request) {
        ServiceType serviceType = ServiceType.builder()
                .serviceCode(request.serviceCode())
                .serviceName(request.serviceName())
                .description(request.description())
                .basePrice(request.basePrice() == null ? BigDecimal.ZERO : request.basePrice())
                .build();
        return appMapper.toServiceTypeResponse(serviceTypeRepository.save(serviceType));
    }

    @Override
    public AdminDto.ServiceTypeResponse updateServiceType(Long id, AdminDto.ServiceTypeRequest request) {
        ServiceType serviceType = serviceTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service type not found with id: " + id));
        serviceType.setServiceCode(request.serviceCode());
        serviceType.setServiceName(request.serviceName());
        serviceType.setDescription(request.description());
        serviceType.setBasePrice(request.basePrice() == null ? BigDecimal.ZERO : request.basePrice());
        return appMapper.toServiceTypeResponse(serviceTypeRepository.save(serviceType));
    }

    @Override
    public void deleteServiceType(Long id) {
        ServiceType serviceType = serviceTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service type not found with id: " + id));
        serviceTypeRepository.delete(serviceType);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyDto.CompanyResponse> getCompanies() {
        return rescueCompanyRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(RescueCompany::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(appMapper::toCompanyResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyDto.CompanyResponse getCompany(Long id) {
        return appMapper.toCompanyResponse(findCompany(id));
    }

    @Override
    public CompanyDto.CompanyResponse createCompany(CompanyDto.CompanyRequest request) {
        Account ownerAccount = resolveCompanyOwner(request.ownerAccountId());
        RescueCompany company = RescueCompany.builder()
                .companyName(request.companyName())
                .taxCode(request.taxCode())
                .licenseNumber(request.licenseNumber())
                .email(request.email())
                .phone(request.phone())
                .description(request.description())
                .status(parseCompanyStatus(request.status()))
                .ownerAccount(ownerAccount)
                .build();
        return appMapper.toCompanyResponse(rescueCompanyRepository.save(company));
    }

    @Override
    public CompanyDto.CompanyResponse updateCompany(Long id, CompanyDto.CompanyRequest request) {
        RescueCompany company = findCompany(id);
        Account ownerAccount = resolveCompanyOwner(request.ownerAccountId());
        if (ownerAccount != null && rescueCompanyRepository.existsByOwnerAccountId(ownerAccount.getId())
                && (company.getOwnerAccount() == null || !ownerAccount.getId().equals(company.getOwnerAccount().getId()))) {
            throw new BadRequestException("This account is already linked to another rescue company");
        }

        company.setCompanyName(request.companyName());
        company.setTaxCode(request.taxCode());
        company.setLicenseNumber(request.licenseNumber());
        company.setEmail(request.email());
        company.setPhone(request.phone());
        company.setDescription(request.description());
        company.setStatus(parseCompanyStatus(request.status()));
        company.setOwnerAccount(ownerAccount);
        return appMapper.toCompanyResponse(rescueCompanyRepository.save(company));
    }

    @Override
    public void deleteCompany(Long id) {
        RescueCompany company = findCompany(id);
        company.setStatus(CompanyStatus.SUSPENDED);
        rescueCompanyRepository.save(company);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyDto.StaffResponse> getCompanyStaff(Long companyId) {
        findCompany(companyId);
        return rescueStaffRepository.findByCompanyIdOrderByIdDesc(companyId)
                .stream()
                .map(appMapper::toStaffResponse)
                .toList();
    }

    @Override
    public CompanyDto.StaffResponse createCompanyStaff(Long companyId, CompanyDto.StaffRequest request) {
        RescueCompany company = findCompany(companyId);
        RescueStaff staff = RescueStaff.builder()
                .company(company)
                .vehicle(resolveAssignedVehicle(company.getId(), request.vehicleId(), null))
                .jobTitle(request.jobTitle())
                .yearsExperience(request.yearsExperience())
                .bio(request.bio())
                .status(parseStaffStatus(request.status()))
                .user(resolveStaffAccount(request))
                .build();
        return appMapper.toStaffResponse(rescueStaffRepository.save(staff));
    }

    @Override
    public CompanyDto.StaffResponse updateCompanyStaff(Long companyId, Long staffId, CompanyDto.StaffRequest request) {
        findCompany(companyId);
        RescueStaff staff = rescueStaffRepository.findByIdAndCompanyId(staffId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + staffId));
        Account user = staff.getUser();

        if (request.email() != null && !request.email().isBlank()
                && !request.email().equalsIgnoreCase(user.getEmail())
                && accountRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("Email is already in use");
        }

        if (request.email() != null && !request.email().isBlank()) {
            user.setEmail(request.email().trim().toLowerCase());
        }
        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName());
        }
        user.setPhone(request.phone());
        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(PasswordUtil.hash(request.password()));
        }
        accountRepository.save(user);

        staff.setJobTitle(request.jobTitle());
        staff.setYearsExperience(request.yearsExperience());
        staff.setBio(request.bio());
        staff.setStatus(parseStaffStatus(request.status()));
        staff.setVehicle(resolveAssignedVehicle(companyId, request.vehicleId(), staff.getId()));
        return appMapper.toStaffResponse(rescueStaffRepository.save(staff));
    }

    @Override
    public void deleteCompanyStaff(Long companyId, Long staffId) {
        findCompany(companyId);
        RescueStaff staff = rescueStaffRepository.findByIdAndCompanyId(staffId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + staffId));
        Account user = staff.getUser();
        user.setStatus(AccountStatus.INACTIVE);
        accountRepository.save(user);
        rescueStaffRepository.delete(staff);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequestDto.RequestSummaryResponse> getAllRequests() {
        return rescueRequestRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(RescueRequest::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(request -> appMapper.toRequestSummaryResponse(
                        request,
                        requestSupportService.getAssignedCompany(request),
                        requestSupportService.getLatestAssignment(request)
                ))
                .toList();
    }

    @Override
    public RequestDto.AssignmentResponse assignStaff(Long requestId, AdminDto.AssignStaffRequest request) {
        RescueRequest rescueRequest = rescueRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Rescue request not found with id: " + requestId));

        RescueStaff staff = rescueStaffRepository.findById(request.staffId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + request.staffId()));

        if (staff.getStatus() != StaffStatus.ACTIVE) {
            throw new BadRequestException("Nhân viên hiện không sẵn sàng (OFFLINE hoặc BUSY)");
        }

        // Lấy trực tiếp Company từ Staff thay vì qua request.companyId()
        RescueCompany company = staff.getCompany();

        RequestAssignment assignment = RequestAssignment.builder()
                .request(rescueRequest)
                .company(company)
                .staff(staff)
                .vehicle(requireAssignedVehicle(staff))
                .assignedByUser(authContext.getCurrentAccount())
                .status(AssignmentStatus.PENDING)
                .build();

        RequestAssignment savedAssignment = requestAssignmentRepository.save(assignment);
        notificationService.notifyAssignmentPending(savedAssignment);

        RescueRequestStatus oldStatus = rescueRequest.getStatus();
        rescueRequest.setStatus(RescueRequestStatus.SEARCHING);
        rescueRequestRepository.save(rescueRequest);

        String historyNote = defaultIfBlank(request.note(), 
                "Admin gán trực tiếp cho nhân viên: " + staff.getUser().getFullName());

        requestStatusHistoryRepository.save(RequestStatusHistory.builder()
                .request(rescueRequest)
                .oldStatus(oldStatus)
                .newStatus(RescueRequestStatus.SEARCHING)
                .changedByUser(authContext.getCurrentAccount())
                .note(historyNote)
                .build());

        return appMapper.toAssignmentResponse(savedAssignment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyDto.StaffResponse> getActiveStaffLocations() {
        return rescueStaffRepository.findAll().stream()
                .filter(s -> s.getStatus() == StaffStatus.ACTIVE)
                .map(appMapper::toStaffResponse)
                .toList();
    }

    // Logic tự động điều phối Staff
    @Override
    public RequestDto.AssignmentResponse autoAssignNearestStaff(Long requestId) {
        return autoAssignNearestStaff(requestId, authContext.getCurrentAccount().getId());
    }

    @Override
    public RequestDto.AssignmentResponse autoAssignNearestStaff(Long requestId, Long assignedByAccountId) {
        RescueRequest rescueRequest = rescueRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu ID: " + requestId));
        Account assignedBy = findAccount(assignedByAccountId);

        if (isDispatchClosed(rescueRequest)) {
            return null;
        }

        RequestDto.AssignmentResponse existingAccepted = requestAssignmentRepository
                .findFirstByRequestIdAndStatusOrderByAssignedAtDesc(requestId, AssignmentStatus.ACCEPTED)
                .map(appMapper::toAssignmentResponse)
                .orElse(null);
        if (existingAccepted != null) {
            return existingAccepted;
        }

        RequestDto.AssignmentResponse existingPending = requestAssignmentRepository
                .findFirstByRequestIdAndStatusOrderByAssignedAtDesc(requestId, AssignmentStatus.PENDING)
                .map(appMapper::toAssignmentResponse)
                .orElse(null);
        if (existingPending != null) {
            return existingPending;
        }

        if (rescueRequest.getLocation() == null || 
            rescueRequest.getLocation().getLatitude() == null || 
            rescueRequest.getLocation().getLongitude() == null) {
            throw new BadRequestException("Yêu cầu không có tọa độ GPS hợp lệ.");
        }

        List<Long> previousStaffIds = requestAssignmentRepository.findByRequestId(requestId).stream()
                .map(RequestAssignment::getStaff)
                .filter(Objects::nonNull)
                .map(RescueStaff::getId)
                .collect(Collectors.toList());

        double reqLat = rescueRequest.getLocation().getLatitude().doubleValue();
        double reqLng = rescueRequest.getLocation().getLongitude().doubleValue();
        double radiusKm = calculateSearchRadiusKm(rescueRequest);

        List<StaffCandidate> candidates = rescueStaffRepository.findAll().stream()
                .filter(staff -> staff.getStatus() == StaffStatus.ACTIVE)
                .filter(staff -> staff.getUser() != null && staff.getUser().getDefaultAddress() != null)
                .filter(staff -> staff.getVehicle() != null)
                .filter(staff -> staff.getVehicle().getStatus() == RescueVehicleStatus.AVAILABLE)
                .filter(staff -> !previousStaffIds.contains(staff.getId()))
                .filter(staff -> !requestAssignmentRepository.existsByStaffIdAndStatusIn(staff.getId(), BUSY_ASSIGNMENT_STATUSES))
                .map(staff -> toStaffCandidate(staff, reqLat, reqLng))
                .filter(Objects::nonNull)
                .filter(candidate -> candidate.distanceKm() <= radiusKm)
                .sorted(Comparator.comparingDouble(StaffCandidate::distanceKm))
                .limit(AUTO_DISPATCH_STAFF_LIMIT)
                .toList();

        if (candidates.isEmpty()) {
            rescueRequest.setStatus(RescueRequestStatus.SEARCHING);
            rescueRequestRepository.save(rescueRequest);
            return null;
        }

        List<RequestAssignment> savedAssignments = candidates.stream()
                .map(candidate -> RequestAssignment.builder()
                        .request(rescueRequest)
                        .company(candidate.staff().getCompany())
                        .staff(candidate.staff())
                        .vehicle(candidate.staff().getVehicle())
                        .assignedByUser(assignedBy)
                        .status(AssignmentStatus.PENDING)
                        .assignedAt(LocalDateTime.now())
                        .build())
                .map(requestAssignmentRepository::save)
                .toList();

        savedAssignments.forEach(notificationService::notifyAssignmentPending);

        RescueRequestStatus oldStatus = rescueRequest.getStatus();
        rescueRequest.setStatus(RescueRequestStatus.SEARCHING);
        rescueRequestRepository.save(rescueRequest);

        requestStatusHistoryRepository.save(RequestStatusHistory.builder()
                .request(rescueRequest)
                .oldStatus(oldStatus)
                .newStatus(RescueRequestStatus.SEARCHING)
                .changedByUser(assignedBy)
                .note("System dispatched request to " + savedAssignments.size()
                        + " nearby staff within " + String.format("%.1f", radiusKm) + " km.")
                .build());

        return appMapper.toAssignmentResponse(savedAssignments.get(0));
    }

    private boolean isDispatchClosed(RescueRequest request) {
        return request.getStatus() == RescueRequestStatus.IN_PROGRESS
                || request.getStatus() == RescueRequestStatus.COMPLETED
                || request.getStatus() == RescueRequestStatus.CANCELED;
    }

    private StaffCandidate toStaffCandidate(RescueStaff staff, double requestLatitude, double requestLongitude) {
        Address staffAddress = staff.getUser().getDefaultAddress();
        if (staffAddress.getLatitude() == null || staffAddress.getLongitude() == null) {
            return null;
        }

        double distanceKm = calculateDistance(
                requestLatitude,
                requestLongitude,
                staffAddress.getLatitude().doubleValue(),
                staffAddress.getLongitude().doubleValue()
        );
        return new StaffCandidate(staff, distanceKm);
    }

    private double calculateSearchRadiusKm(RescueRequest request) {
        long elapsedSeconds = 0;
        if (request.getCreatedAt() != null) {
            elapsedSeconds = Math.max(0, Duration.between(request.getCreatedAt(), LocalDateTime.now()).toSeconds());
        }
        return INITIAL_SEARCH_RADIUS_KM + (SEARCH_RADIUS_GROWTH_KM_PER_SECOND * elapsedSeconds);
    }

    private record StaffCandidate(RescueStaff staff, double distanceKm) {
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371; 
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private Account findAccount(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + id));
    }

    private RescueCompany findCompany(Long id) {
        return rescueCompanyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rescue company not found with id: " + id));
    }

    private Role getOrCreateRole(RoleName roleName) {
        return roleRepository.findByRoleName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().roleName(roleName).build()));
    }

    private Account resolveCompanyOwner(Long ownerAccountId) {
        if (ownerAccountId == null) {
            return null;
        }
        Account ownerAccount = findAccount(ownerAccountId);
        if (ownerAccount.getRole().getRoleName() != RoleName.RESCUE_COMPANY) {
            throw new BadRequestException("Owner account must have role RESCUE_COMPANY");
        }
        return ownerAccount;
    }

    private Account resolveStaffAccount(CompanyDto.StaffRequest request) {
        if (request.userId() != null) {
            Account existingAccount = findAccount(request.userId());
            if (existingAccount.getRole().getRoleName() != RoleName.RESCUE_STAFF) {
                throw new BadRequestException("Existing account must have role RESCUE_STAFF");
            }
            if (rescueStaffRepository.findByUserId(existingAccount.getId()).isPresent()) {
                throw new BadRequestException("This account is already linked to another rescue staff profile");
            }
            existingAccount.setStatus(AccountStatus.ACTIVE);
            return existingAccount;
        }

        if (request.email() == null || request.email().isBlank()
                || request.password() == null || request.password().isBlank()
                || request.fullName() == null || request.fullName().isBlank()) {
            throw new BadRequestException("email, password, and fullName are required when creating a new staff account");
        }
        if (accountRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("Email is already in use");
        }

        return accountRepository.save(Account.builder()
                .email(request.email().trim().toLowerCase())
                .passwordHash(PasswordUtil.hash(request.password()))
                .fullName(request.fullName())
                .phone(request.phone())
                .status(AccountStatus.ACTIVE)
                .role(getOrCreateRole(RoleName.RESCUE_STAFF))
                .build());
    }

    private RescueVehicle resolveAssignedVehicle(Long companyId, Long vehicleId, Long currentStaffId) {
        if (vehicleId == null) {
            return null;
        }

        RescueVehicle vehicle = rescueVehicleRepository.findByIdAndCompanyId(vehicleId, companyId)
                .orElseThrow(() -> new BadRequestException("Vehicle does not belong to the selected company"));

        rescueStaffRepository.findByVehicleId(vehicleId)
                .filter(existing -> currentStaffId == null || !existing.getId().equals(currentStaffId))
                .ifPresent(existing -> {
                    throw new BadRequestException("Vehicle is already assigned to another staff");
                });

        return vehicle;
    }

    private RescueVehicle requireAssignedVehicle(RescueStaff staff) {
        RescueVehicle vehicle = staff.getVehicle();
        if (vehicle == null) {
            throw new BadRequestException("Staff must be assigned a rescue vehicle before dispatching");
        }
        if (vehicle.getStatus() != RescueVehicleStatus.AVAILABLE) {
            throw new BadRequestException("Staff's assigned vehicle is not available");
        }
        return vehicle;
    }

    private RoleName parseRoleName(String value) {
        try {
            return RoleName.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid role name: " + value);
        }
    }

    private AccountStatus parseAccountStatus(String value) {
        try {
            return AccountStatus.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid account status: " + value);
        }
    }

    private CompanyStatus parseCompanyStatus(String value) {
        try {
            return CompanyStatus.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid company status: " + value);
        }
    }

    private StaffStatus parseStaffStatus(String value) {
        try {
            return StaffStatus.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid staff status: " + value);
        }
    }

    private void validateAdultDateOfBirth(LocalDate dateOfBirth) {
        if (dateOfBirth == null || dateOfBirth.isAfter(LocalDate.now().minusYears(MINIMUM_ACCOUNT_AGE))) {
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

    private String defaultIfBlank(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value;
    }
}
