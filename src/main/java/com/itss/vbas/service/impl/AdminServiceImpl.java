package com.itss.vbas.service.impl;

import java.util.Comparator;
import java.util.List;

import com.itss.vbas.dto.admin.AdminDto;
import com.itss.vbas.dto.common.CommonDto;
import com.itss.vbas.dto.company.CompanyDto;
import com.itss.vbas.dto.request.RequestDto;
import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.IncidentType;
import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.entity.RescueCompany;
import com.itss.vbas.entity.RescueCompanyBranch;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.entity.RescueStaff;
import com.itss.vbas.entity.Role;
import com.itss.vbas.entity.ServiceType;
import com.itss.vbas.enums.AccountStatus;
import com.itss.vbas.enums.AssignmentStatus;
import com.itss.vbas.enums.CompanyStatus;
import com.itss.vbas.enums.RescueRequestStatus;
import com.itss.vbas.enums.RoleName;
import com.itss.vbas.enums.StaffStatus;
import com.itss.vbas.exception.BadRequestException;
import com.itss.vbas.exception.ResourceNotFoundException;
import com.itss.vbas.mapper.AppMapper;
import com.itss.vbas.repository.AccountRepository;
import com.itss.vbas.repository.IncidentTypeRepository;
import com.itss.vbas.repository.RequestAssignmentRepository;
import com.itss.vbas.repository.RescueCompanyBranchRepository;
import com.itss.vbas.repository.RescueCompanyRepository;
import com.itss.vbas.repository.RescueRequestRepository;
import com.itss.vbas.repository.RescueStaffRepository;
import com.itss.vbas.repository.RoleRepository;
import com.itss.vbas.repository.ServiceTypeRepository;
import com.itss.vbas.security.AuthContext;
import com.itss.vbas.service.AddressService;
import com.itss.vbas.service.AdminService;
import com.itss.vbas.service.RequestSupportService;
import com.itss.vbas.util.PasswordUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final IncidentTypeRepository incidentTypeRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final RescueCompanyRepository rescueCompanyRepository;
    private final RescueCompanyBranchRepository rescueCompanyBranchRepository;
    private final RescueStaffRepository rescueStaffRepository;
    private final RescueRequestRepository rescueRequestRepository;
    private final RequestAssignmentRepository requestAssignmentRepository;
    private final AddressService addressService;
    private final RequestSupportService requestSupportService;
    private final AuthContext authContext;
    private final AppMapper appMapper;

    public AdminServiceImpl(
            AccountRepository accountRepository,
            RoleRepository roleRepository,
            IncidentTypeRepository incidentTypeRepository,
            ServiceTypeRepository serviceTypeRepository,
            RescueCompanyRepository rescueCompanyRepository,
            RescueCompanyBranchRepository rescueCompanyBranchRepository,
            RescueStaffRepository rescueStaffRepository,
            RescueRequestRepository rescueRequestRepository,
            RequestAssignmentRepository requestAssignmentRepository,
            AddressService addressService,
            RequestSupportService requestSupportService,
            AuthContext authContext,
            AppMapper appMapper
    ) {
        this.accountRepository = accountRepository;
        this.roleRepository = roleRepository;
        this.incidentTypeRepository = incidentTypeRepository;
        this.serviceTypeRepository = serviceTypeRepository;
        this.rescueCompanyRepository = rescueCompanyRepository;
        this.rescueCompanyBranchRepository = rescueCompanyBranchRepository;
        this.rescueStaffRepository = rescueStaffRepository;
        this.rescueRequestRepository = rescueRequestRepository;
        this.requestAssignmentRepository = requestAssignmentRepository;
        this.addressService = addressService;
        this.requestSupportService = requestSupportService;
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
                .cccd(request.cccd())
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

        account.setEmail(request.email().trim().toLowerCase());
        account.setFullName(request.fullName());
        account.setPhone(request.phone());
        account.setAvatarUrl(request.avatarUrl());
        account.setStatus(parseAccountStatus(request.status()));
        account.setRole(getOrCreateRole(parseRoleName(request.roleName())));
        account.setDateOfBirth(request.dateOfBirth());
        account.setGender(request.gender());
        account.setCccd(request.cccd());
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
    public List<CompanyDto.BranchResponse> getCompanyBranches(Long companyId) {
        findCompany(companyId);
        return rescueCompanyBranchRepository.findByCompanyIdOrderByIdDesc(companyId)
                .stream()
                .map(appMapper::toBranchResponse)
                .toList();
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
        RescueCompanyBranch branch = request.branchId() == null ? null : findBranch(request.branchId(), companyId);
        RescueStaff staff = RescueStaff.builder()
                .company(company)
                .branch(branch)
                .jobTitle(request.jobTitle())
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

        staff.setBranch(request.branchId() == null ? null : findBranch(request.branchId(), companyId));
        staff.setJobTitle(request.jobTitle());
        staff.setStatus(parseStaffStatus(request.status()));
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
                .map(request -> appMapper.toRequestSummaryResponse(request, requestSupportService.getAssignedCompany(request)))
                .toList();
    }

    @Override
    public RequestDto.AssignmentResponse assignCompany(Long requestId, AdminDto.AssignCompanyRequest request) {
        Account currentAdmin = authContext.getCurrentAccount();
        RescueRequest rescueRequest = rescueRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Rescue request not found with id: " + requestId));
        if (rescueRequest.getStatus() == RescueRequestStatus.COMPLETED || rescueRequest.getStatus() == RescueRequestStatus.CANCELED) {
            throw new BadRequestException("Cannot assign company for a completed or canceled request");
        }

        RescueCompany company = findCompany(request.companyId());
        if (company.getStatus() != CompanyStatus.APPROVED) {
            throw new BadRequestException("Only approved companies can be assigned");
        }

        RequestAssignment assignment = RequestAssignment.builder()
                .request(rescueRequest)
                .company(company)
                .assignedByUser(currentAdmin)
                .status(AssignmentStatus.PENDING)
                .build();
        RequestAssignment savedAssignment = requestAssignmentRepository.save(assignment);
        requestSupportService.changeRequestStatus(rescueRequest, RescueRequestStatus.MATCHED, currentAdmin, request.note());
        return appMapper.toAssignmentResponse(savedAssignment);
    }

    private Account findAccount(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + id));
    }

    private RescueCompany findCompany(Long id) {
        return rescueCompanyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rescue company not found with id: " + id));
    }

    private RescueCompanyBranch findBranch(Long branchId, Long companyId) {
        return rescueCompanyBranchRepository.findByIdAndCompanyId(branchId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id: " + branchId));
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

    private String defaultIfBlank(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value;
    }
}
