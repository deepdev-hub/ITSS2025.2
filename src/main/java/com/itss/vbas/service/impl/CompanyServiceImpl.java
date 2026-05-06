package com.itss.vbas.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import com.itss.vbas.dto.common.CommonDto;
import com.itss.vbas.dto.company.CompanyDto;
import com.itss.vbas.dto.request.RequestDto;
import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.Address;
import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.entity.RescueCompany;
import com.itss.vbas.entity.RescueCompanyBranch;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.entity.RescueStaff;
import com.itss.vbas.entity.RescueVehicle;
import com.itss.vbas.entity.Role;
import com.itss.vbas.enums.AccountStatus;
import com.itss.vbas.enums.AssignmentStatus;
import com.itss.vbas.enums.RescueRequestStatus;
import com.itss.vbas.enums.RescueVehicleStatus;
import com.itss.vbas.enums.RoleName;
import com.itss.vbas.enums.StaffStatus;
import com.itss.vbas.exception.BadRequestException;
import com.itss.vbas.exception.ResourceNotFoundException;
import com.itss.vbas.mapper.AppMapper;
import com.itss.vbas.repository.AccountRepository;
import com.itss.vbas.repository.RequestAssignmentRepository;
import com.itss.vbas.repository.RescueCompanyBranchRepository;
import com.itss.vbas.repository.RescueCompanyRepository;
import com.itss.vbas.repository.RescueRequestRepository;
import com.itss.vbas.repository.RescueStaffRepository;
import com.itss.vbas.repository.RescueVehicleRepository;
import com.itss.vbas.repository.RoleRepository;
import com.itss.vbas.security.AuthContext;
import com.itss.vbas.service.AddressService;
import com.itss.vbas.service.CompanyService;
import com.itss.vbas.service.RequestSupportService;
import com.itss.vbas.util.PasswordUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CompanyServiceImpl implements CompanyService {

    private final RescueCompanyRepository rescueCompanyRepository;
    private final RescueCompanyBranchRepository rescueCompanyBranchRepository;
    private final RescueStaffRepository rescueStaffRepository;
    private final RescueVehicleRepository rescueVehicleRepository;
    private final RescueRequestRepository rescueRequestRepository;
    private final RequestAssignmentRepository requestAssignmentRepository;
    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final AddressService addressService;
    private final RequestSupportService requestSupportService;
    private final AuthContext authContext;
    private final AppMapper appMapper;

    public CompanyServiceImpl(
            RescueCompanyRepository rescueCompanyRepository,
            RescueCompanyBranchRepository rescueCompanyBranchRepository,
            RescueStaffRepository rescueStaffRepository,
            RescueVehicleRepository rescueVehicleRepository,
            RescueRequestRepository rescueRequestRepository,
            RequestAssignmentRepository requestAssignmentRepository,
            AccountRepository accountRepository,
            RoleRepository roleRepository,
            AddressService addressService,
            RequestSupportService requestSupportService,
            AuthContext authContext,
            AppMapper appMapper
    ) {
        this.rescueCompanyRepository = rescueCompanyRepository;
        this.rescueCompanyBranchRepository = rescueCompanyBranchRepository;
        this.rescueStaffRepository = rescueStaffRepository;
        this.rescueVehicleRepository = rescueVehicleRepository;
        this.rescueRequestRepository = rescueRequestRepository;
        this.requestAssignmentRepository = requestAssignmentRepository;
        this.accountRepository = accountRepository;
        this.roleRepository = roleRepository;
        this.addressService = addressService;
        this.requestSupportService = requestSupportService;
        this.authContext = authContext;
        this.appMapper = appMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyDto.CompanyResponse getMyCompany() {
        return appMapper.toCompanyResponse(getCurrentCompany());
    }

    @Override
    public CompanyDto.CompanyResponse updateMyCompany(CompanyDto.CompanyRequest request) {
        RescueCompany company = getCurrentCompany();
        company.setCompanyName(request.companyName());
        company.setTaxCode(request.taxCode());
        company.setLicenseNumber(request.licenseNumber());
        company.setEmail(request.email());
        company.setPhone(request.phone());
        company.setDescription(request.description());
        return appMapper.toCompanyResponse(rescueCompanyRepository.save(company));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyDto.BranchResponse> getBranches() {
        RescueCompany company = getCurrentCompany();
        return rescueCompanyBranchRepository.findByCompanyIdOrderByIdDesc(company.getId())
                .stream()
                .map(appMapper::toBranchResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyDto.BranchResponse getBranch(Long id) {
        RescueCompany company = getCurrentCompany();
        return appMapper.toBranchResponse(findBranch(id, company.getId()));
    }

    @Override
    public CompanyDto.BranchResponse createBranch(CompanyDto.BranchRequest request) {
        RescueCompany company = getCurrentCompany();
        RescueCompanyBranch branch = RescueCompanyBranch.builder()
                .company(company)
                .branchName(request.branchName())
                .phone(request.phone())
                .address(addressService.createAddress(request.address()))
                .latitude(request.latitude())
                .longitude(request.longitude())
                .isMainBranch(request.isMainBranch())
                .build();
        return appMapper.toBranchResponse(rescueCompanyBranchRepository.save(branch));
    }

    @Override
    public CompanyDto.BranchResponse updateBranch(Long id, CompanyDto.BranchRequest request) {
        RescueCompany company = getCurrentCompany();
        RescueCompanyBranch branch = findBranch(id, company.getId());
        branch.setBranchName(request.branchName());
        branch.setPhone(request.phone());
        branch.setAddress(addressService.updateAddress(branch.getAddress(), request.address()));
        branch.setLatitude(request.latitude());
        branch.setLongitude(request.longitude());
        branch.setIsMainBranch(request.isMainBranch());
        return appMapper.toBranchResponse(rescueCompanyBranchRepository.save(branch));
    }

    @Override
    public void deleteBranch(Long id) {
        RescueCompany company = getCurrentCompany();
        rescueCompanyBranchRepository.delete(findBranch(id, company.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyDto.StaffResponse> getStaff() {
        RescueCompany company = getCurrentCompany();
        return rescueStaffRepository.findByCompanyIdOrderByIdDesc(company.getId())
                .stream()
                .map(staff -> {

                    java.math.BigDecimal lat = null;
                    java.math.BigDecimal lng = null;

                    if (staff.getUser() != null && staff.getUser().getDefaultAddress() != null) {
                        lat = staff.getUser().getDefaultAddress().getLatitude();
                        lng = staff.getUser().getDefaultAddress().getLongitude();
                    }

                    return new CompanyDto.StaffResponse(
                        staff.getId(),
                        staff.getUser() != null ? staff.getUser().getId() : null,
                        staff.getCompany() != null ? staff.getCompany().getId() : null,
                        staff.getBranch() != null ? staff.getBranch().getId() : null,
                        staff.getUser() != null ? staff.getUser().getFullName() : null,
                        staff.getUser() != null ? staff.getUser().getEmail() : null,
                        staff.getUser() != null ? staff.getUser().getPhone() : null,
                        staff.getJobTitle(),
                        staff.getStatus() != null ? staff.getStatus().name() : null,
                        lat, 
                        lng  
                    );
                })
                .toList();
            }


    @Override
    public CompanyDto.StaffResponse createStaff(CompanyDto.StaffRequest request) {
        RescueCompany company = getCurrentCompany();
        RescueCompanyBranch branch = request.branchId() == null ? null : findBranch(request.branchId(), company.getId());
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
    public CompanyDto.StaffResponse updateStaff(Long id, CompanyDto.StaffRequest request) {
        RescueCompany company = getCurrentCompany();
        RescueStaff staff = rescueStaffRepository.findByIdAndCompanyId(id, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));
        Account user = staff.getUser();

        if (request.email() != null && !request.email().equalsIgnoreCase(user.getEmail()) && accountRepository.existsByEmailIgnoreCase(request.email())) {
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

        staff.setBranch(request.branchId() == null ? null : findBranch(request.branchId(), company.getId()));
        staff.setJobTitle(request.jobTitle());
        staff.setStatus(parseStaffStatus(request.status()));
        return appMapper.toStaffResponse(rescueStaffRepository.save(staff));
    }

    @Override
    public void deleteStaff(Long id) {
        RescueCompany company = getCurrentCompany();
        RescueStaff staff = rescueStaffRepository.findByIdAndCompanyId(id, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));
        Account user = staff.getUser();
        user.setStatus(AccountStatus.INACTIVE);
        accountRepository.save(user);
        rescueStaffRepository.delete(staff);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyDto.VehicleResponse> getVehicles() {
        RescueCompany company = getCurrentCompany();
        return rescueVehicleRepository.findByBranchCompanyIdOrderByIdDesc(company.getId())
                .stream()
                .map(appMapper::toRescueVehicleResponse)
                .toList();
    }

    @Override
    public CompanyDto.VehicleResponse createVehicle(CompanyDto.VehicleRequest request) {
        RescueCompany company = getCurrentCompany();
        RescueCompanyBranch branch = findBranch(request.branchId(), company.getId());
        RescueVehicle rescueVehicle = RescueVehicle.builder()
                .branch(branch)
                .vehicleCode(request.vehicleCode())
                .vehicleType(request.vehicleType())
                .plateNumber(request.plateNumber())
                .status(parseVehicleStatus(request.status()))
                .build();
        return appMapper.toRescueVehicleResponse(rescueVehicleRepository.save(rescueVehicle));
    }

    @Override
    public CompanyDto.VehicleResponse updateVehicle(Long id, CompanyDto.VehicleRequest request) {
        RescueCompany company = getCurrentCompany();
        RescueVehicle rescueVehicle = rescueVehicleRepository.findByIdAndBranchCompanyId(id, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        rescueVehicle.setBranch(findBranch(request.branchId(), company.getId()));
        rescueVehicle.setVehicleCode(request.vehicleCode());
        rescueVehicle.setVehicleType(request.vehicleType());
        rescueVehicle.setPlateNumber(request.plateNumber());
        rescueVehicle.setStatus(parseVehicleStatus(request.status()));
        return appMapper.toRescueVehicleResponse(rescueVehicleRepository.save(rescueVehicle));
    }

    @Override
    public void deleteVehicle(Long id) {
        RescueCompany company = getCurrentCompany();
        RescueVehicle rescueVehicle = rescueVehicleRepository.findByIdAndBranchCompanyId(id, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        rescueVehicleRepository.delete(rescueVehicle);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequestDto.RequestSummaryResponse> getCompanyRequests() {
        RescueCompany company = getCurrentCompany();
        return rescueRequestRepository.findAssignedRequestsByCompanyId(company.getId())
                .stream()
                .map(request -> appMapper.toRequestSummaryResponse(request, company))
                .toList();
    }

    @Override
    public RequestDto.AssignmentResponse assignStaffAndVehicle(Long requestId, RequestDto.AssignmentRequest request) {
        if (request.staffId() == null || request.vehicleId() == null) {
            throw new BadRequestException("Both staffId and vehicleId are required");
        }

        Account account = authContext.getCurrentAccount();
        RescueCompany company = getCurrentCompany();
        RescueRequest rescueRequest = rescueRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Rescue request not found with id: " + requestId));
        requestSupportService.assertAssignedCompany(company, rescueRequest);

        RescueStaff staff = rescueStaffRepository.findByIdAndCompanyId(request.staffId(), company.getId())
                .orElseThrow(() -> new BadRequestException("Selected staff does not belong to your company"));
        RescueVehicle vehicle = rescueVehicleRepository.findByIdAndBranchCompanyId(request.vehicleId(), company.getId())
                .orElseThrow(() -> new BadRequestException("Selected rescue vehicle does not belong to your company"));

        RequestAssignment assignment = requestAssignmentRepository.findFirstByRequestIdAndCompanyIdOrderByAssignedAtDesc(requestId, company.getId())
                .orElseGet(() -> RequestAssignment.builder()
                        .request(rescueRequest)
                        .company(company)
                        .assignedByUser(account)
                        .status(AssignmentStatus.PENDING)
                        .build());

        assignment.setAssignedByUser(account);
        assignment.setStaff(staff);
        assignment.setVehicle(vehicle);
        assignment.setAcceptedAt(LocalDateTime.now());
        assignment.setRejectedAt(null);
        assignment.setStatus(AssignmentStatus.ACCEPTED);
        RequestAssignment savedAssignment = requestAssignmentRepository.save(assignment);

        if (rescueRequest.getStatus() == RescueRequestStatus.CREATED || rescueRequest.getStatus() == RescueRequestStatus.SEARCHING) {
            requestSupportService.changeRequestStatus(rescueRequest, RescueRequestStatus.MATCHED, account, request.note());
        }

        return appMapper.toAssignmentResponse(savedAssignment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequestDto.AssignmentResponse> getMyStaffAssignments() {
        Account account = authContext.getCurrentAccount();
        RescueStaff staff = requestSupportService.getCurrentStaff(account);
        return requestAssignmentRepository.findByStaffIdOrderByAssignedAtDesc(staff.getId())
                .stream()
                .map(appMapper::toAssignmentResponse)
                .toList();
    }

    private RescueCompany getCurrentCompany() {
        return requestSupportService.getCurrentCompany(authContext.getCurrentAccount());
    }

    private RescueCompanyBranch findBranch(Long branchId, Long companyId) {
        return rescueCompanyBranchRepository.findByIdAndCompanyId(branchId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id: " + branchId));
    }

    private Account resolveStaffAccount(CompanyDto.StaffRequest request) {
        if (request.userId() != null) {
            Account existingAccount = accountRepository.findById(request.userId())
                    .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + request.userId()));
            if (existingAccount.getRole().getRoleName() != RoleName.RESCUE_STAFF) {
                throw new BadRequestException("Existing account must have role RESCUE_STAFF");
            }
            if (rescueStaffRepository.findByUserId(existingAccount.getId()).isPresent()) {
                throw new BadRequestException("This account is already linked to another rescue staff profile");
            }
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

    private Role getOrCreateRole(RoleName roleName) {
        return roleRepository.findByRoleName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().roleName(roleName).build()));
    }

    private StaffStatus parseStaffStatus(String value) {
        try {
            return StaffStatus.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid staff status: " + value);
        }
    }

    private RescueVehicleStatus parseVehicleStatus(String value) {
        try {
            return RescueVehicleStatus.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid rescue vehicle status: " + value);
        }
    }

    @Override
    public void updateStaffLocation(CompanyDto.LocationUpdateRequest request) {
        Account account = authContext.getCurrentAccount(); // Lấy account của Staff

        // Lay dia chi mac dinh
        Address currentAddress = account.getDefaultAddress(); 
        
        if(currentAddress == null){
            CommonDto.AddressRequest newAddressReq = new CommonDto.AddressRequest(
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                request.latitude(), 
                request.longitude()
            );
            Address savedAddress = addressService.createAddress(newAddressReq);

            account.setDefaultAddress(savedAddress);
            accountRepository.save(account);
        } else {
            CommonDto.AddressRequest updateReq = new CommonDto.AddressRequest(
                currentAddress.getCountry(),
                currentAddress.getProvince(),
                currentAddress.getDistrict(),
                currentAddress.getWard(),
                currentAddress.getStreet(),
                currentAddress.getDetail(),
                request.latitude(),
                request.longitude()
            );

            addressService.updateAddress(currentAddress, updateReq);
        }
    }
}
