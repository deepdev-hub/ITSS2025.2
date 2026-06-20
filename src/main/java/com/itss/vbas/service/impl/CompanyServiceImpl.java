package com.itss.vbas.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

import com.itss.vbas.dto.common.CommonDto;
import com.itss.vbas.dto.company.CompanyDto;
import com.itss.vbas.dto.request.RequestDto;
import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.Address;
import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.entity.RescueCompany;
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
import com.itss.vbas.repository.RescueCompanyRepository;
import com.itss.vbas.repository.RescueRequestRepository;
import com.itss.vbas.repository.RescueStaffRepository;
import com.itss.vbas.repository.RescueVehicleRepository;
import com.itss.vbas.repository.ReviewRepository;
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

    private static final double NEARBY_REQUEST_RADIUS_KM = 20d;

    private final RescueCompanyRepository rescueCompanyRepository;
    private final RescueStaffRepository rescueStaffRepository;
    private final RescueVehicleRepository rescueVehicleRepository;
    private final ReviewRepository reviewRepository;
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
            RescueStaffRepository rescueStaffRepository,
            RescueVehicleRepository rescueVehicleRepository,
            ReviewRepository reviewRepository,
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
        this.rescueStaffRepository = rescueStaffRepository;
        this.rescueVehicleRepository = rescueVehicleRepository;
        this.reviewRepository = reviewRepository;
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
    public List<CompanyDto.StaffResponse> getStaff() {
        RescueCompany company = getCurrentCompany();
        return rescueStaffRepository.findByCompanyIdOrderByIdDesc(company.getId())
                .stream()
                .map(appMapper::toStaffResponse)
                .toList();
    }

    @Override
    public CompanyDto.StaffResponse createStaff(CompanyDto.StaffRequest request) {
        RescueCompany company = getCurrentCompany();
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

        staff.setJobTitle(request.jobTitle());
        staff.setYearsExperience(request.yearsExperience());
        staff.setBio(request.bio());
        staff.setStatus(parseStaffStatus(request.status()));
        staff.setVehicle(resolveAssignedVehicle(company.getId(), request.vehicleId(), staff.getId()));
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
    public CompanyDto.StaffProfileResponse getStaffProfile(Long id) {
        RescueStaff staff = rescueStaffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));
        Double averageRatingValue = reviewRepository.findAverageRatingByStaffId(staff.getId());
        BigDecimal averageRating = averageRatingValue == null
                ? null
                : BigDecimal.valueOf(averageRatingValue).setScale(2, RoundingMode.HALF_UP);

        return new CompanyDto.StaffProfileResponse(
                staff.getId(),
                staff.getUser().getId(),
                staff.getUser().getAvatarUrl(),
                staff.getUser().getFullName(),
                staff.getUser().getEmail(),
                staff.getUser().getPhone(),
                staff.getCompany().getId(),
                staff.getCompany().getCompanyName(),
                staff.getJobTitle(),
                staff.getStatus().name(),
                staff.getYearsExperience(),
                averageRating,
                requestAssignmentRepository.countByStaffIdAndStatus(staff.getId(), AssignmentStatus.COMPLETED),
                staff.getBio()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyDto.VehicleResponse> getVehicles() {
        RescueCompany company = getCurrentCompany();
        return rescueVehicleRepository.findByCompanyIdOrderByIdDesc(company.getId())
                .stream()
                .map(appMapper::toRescueVehicleResponse)
                .toList();
    }

    @Override
    public CompanyDto.VehicleResponse createVehicle(CompanyDto.VehicleRequest request) {
        RescueCompany company = getCurrentCompany();
        RescueVehicle rescueVehicle = RescueVehicle.builder()
                .company(company)
                .vehicleCode(request.vehicleCode())
                .vehicleType(request.vehicleType())
                .plateNumber(request.plateNumber())
                .status(parseVehicleStatus(request.status()))
                .build();
        RescueVehicle savedVehicle = rescueVehicleRepository.save(rescueVehicle);
        applyVehicleAssignment(company.getId(), savedVehicle, request.assignedStaffId());
        return appMapper.toRescueVehicleResponse(reloadVehicle(company.getId(), savedVehicle.getId()));
    }

    @Override
    public CompanyDto.VehicleResponse updateVehicle(Long id, CompanyDto.VehicleRequest request) {
        RescueCompany company = getCurrentCompany();
        RescueVehicle rescueVehicle = rescueVehicleRepository.findByIdAndCompanyId(id, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        rescueVehicle.setVehicleCode(request.vehicleCode());
        rescueVehicle.setVehicleType(request.vehicleType());
        rescueVehicle.setPlateNumber(request.plateNumber());
        rescueVehicle.setStatus(parseVehicleStatus(request.status()));
        RescueVehicle savedVehicle = rescueVehicleRepository.save(rescueVehicle);
        applyVehicleAssignment(company.getId(), savedVehicle, request.assignedStaffId());
        return appMapper.toRescueVehicleResponse(reloadVehicle(company.getId(), savedVehicle.getId()));
    }

    @Override
    public void deleteVehicle(Long id) {
        RescueCompany company = getCurrentCompany();
        RescueVehicle rescueVehicle = rescueVehicleRepository.findByIdAndCompanyId(id, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        if (rescueStaffRepository.findByVehicleIdAndCompanyId(id, company.getId()).isPresent()) {
            throw new BadRequestException("Vehicle is assigned to a staff and cannot be deleted");
        }
        rescueVehicleRepository.delete(rescueVehicle);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequestDto.RequestSummaryResponse> getCompanyRequests() {
        RescueCompany company = getCurrentCompany();
        return rescueRequestRepository.findAssignedRequestsByCompanyId(company.getId())
                .stream()
                .map(request -> {
                    RequestAssignment currentAssignment = requestAssignmentRepository
                            .findFirstByRequestIdAndCompanyIdOrderByAssignedAtDesc(request.getId(), company.getId())
                            .orElse(null);
                    return appMapper.toRequestSummaryResponse(request, company, currentAssignment);
                })
                .toList();
    }

    @Override
    public RequestDto.AssignmentResponse assignStaffAndVehicle(Long requestId, RequestDto.AssignmentRequest request) {
        if (request.staffId() == null) {
            throw new BadRequestException("staffId is required");
        }

        Account account = authContext.getCurrentAccount();
        RescueCompany company = getCurrentCompany();
        RescueRequest rescueRequest = rescueRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Rescue request not found with id: " + requestId));
        requestSupportService.assertAssignedCompany(company, rescueRequest);

        RescueStaff staff = rescueStaffRepository.findByIdAndCompanyId(request.staffId(), company.getId())
                .orElseThrow(() -> new BadRequestException("Selected staff does not belong to your company"));
        RescueVehicle vehicle = requireAssignedVehicle(staff);
        if (request.vehicleId() != null && !request.vehicleId().equals(vehicle.getId())) {
            throw new BadRequestException("Selected vehicle does not match the staff's assigned vehicle");
        }

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
        staff.setStatus(StaffStatus.BUSY);
        rescueStaffRepository.save(staff);

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

    private RescueVehicle resolveAssignedVehicle(Long companyId, Long vehicleId, Long currentStaffId) {
        if (vehicleId == null) {
            return null;
        }

        RescueVehicle vehicle = rescueVehicleRepository.findByIdAndCompanyId(vehicleId, companyId)
                .orElseThrow(() -> new BadRequestException("Vehicle does not belong to your company"));

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

    private void applyVehicleAssignment(Long companyId, RescueVehicle vehicle, Long assignedStaffId) {
        rescueStaffRepository.findByVehicleIdAndCompanyId(vehicle.getId(), companyId)
                .ifPresent(currentOwner -> {
                    if (assignedStaffId == null || !currentOwner.getId().equals(assignedStaffId)) {
                        currentOwner.setVehicle(null);
                        rescueStaffRepository.save(currentOwner);
                    }
                });

        if (assignedStaffId == null) {
            return;
        }

        RescueStaff targetStaff = rescueStaffRepository.findByIdAndCompanyId(assignedStaffId, companyId)
                .orElseThrow(() -> new BadRequestException("Selected staff does not belong to your company"));

        rescueStaffRepository.findByVehicleId(vehicle.getId())
                .filter(existing -> !existing.getId().equals(targetStaff.getId()))
                .ifPresent(existing -> {
                    throw new BadRequestException("Vehicle is already assigned to another staff");
                });

        if (targetStaff.getVehicle() != null && !targetStaff.getVehicle().getId().equals(vehicle.getId())) {
            throw new BadRequestException("Selected staff already manages another vehicle");
        }

        targetStaff.setVehicle(vehicle);
        rescueStaffRepository.save(targetStaff);
    }

    private RescueVehicle reloadVehicle(Long companyId, Long vehicleId) {
        return rescueVehicleRepository.findByIdAndCompanyId(vehicleId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));
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
        Account account = authContext.getCurrentAccount(); 

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

    @Override
    @Transactional(readOnly = true)
    public CompanyDto.StaffStatusResponse getMyStaffStatus() {
        RescueStaff staff = requestSupportService.getCurrentStaff(authContext.getCurrentAccount());
        return toStaffStatusResponse(staff);
    }

    @Override
    public CompanyDto.StaffStatusResponse updateMyStaffStatus(CompanyDto.StaffStatusUpdateRequest request) {
        RescueStaff staff = requestSupportService.getCurrentStaff(authContext.getCurrentAccount());
        StaffStatus nextStatus = parseStaffStatus(request.status());
        if (nextStatus == StaffStatus.BUSY) {
            throw new BadRequestException("Staff cannot manually switch to BUSY");
        }
        if (staff.getStatus() == StaffStatus.BUSY) {
            boolean trulyBusy = requestAssignmentRepository.existsByStaffIdAndStatusIn(
                    staff.getId(),
                    java.util.List.of(AssignmentStatus.PENDING, AssignmentStatus.ACCEPTED)
            );
            if (trulyBusy) {
                throw new BadRequestException("Cannot change status while handling a request");
            }
        }
        staff.setStatus(nextStatus);
        return toStaffStatusResponse(rescueStaffRepository.save(staff));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequestDto.NearbyRequestSummaryResponse> getNearbySearchingRequests() {
        RescueStaff staff = requestSupportService.getCurrentStaff(authContext.getCurrentAccount());
        validateStaffCanBrowseNearbyRequests(staff);

        Address staffAddress = requireStaffCoordinates(staff);
        double staffLat = staffAddress.getLatitude().doubleValue();
        double staffLng = staffAddress.getLongitude().doubleValue();

        return rescueRequestRepository.findByStatus(RescueRequestStatus.SEARCHING).stream()
                .filter(this::hasDispatchableLocation)
                .filter(request -> !requestAssignmentRepository.existsByRequestIdAndStatus(request.getId(), AssignmentStatus.ACCEPTED))
                .filter(request -> !hasRejectedAssignmentForStaff(request.getId(), staff.getId()))
                .map(request -> toNearbyCandidate(request, staffLat, staffLng))
                .filter(Objects::nonNull)
                .filter(candidate -> candidate.distanceKm() <= NEARBY_REQUEST_RADIUS_KM)
                .sorted(Comparator.comparingDouble(NearbyCandidate::distanceKm))
                .map(candidate -> appMapper.toNearbyRequestSummaryResponse(candidate.request(), roundDistance(candidate.distanceKm())))
                .toList();
    }

    @Override
    public RequestDto.AssignmentResponse acceptNearbySearchingRequest(Long requestId) {
        Account account = authContext.getCurrentAccount();
        RescueStaff staff = requestSupportService.getCurrentStaff(account);
        validateStaffCanBrowseNearbyRequests(staff);

        RescueRequest request = rescueRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Rescue request not found with id: " + requestId));
        if (request.getStatus() != RescueRequestStatus.SEARCHING) {
            throw new BadRequestException("Request is no longer searching for staff");
        }
        if (!hasDispatchableLocation(request)) {
            throw new BadRequestException("Request does not have valid GPS coordinates");
        }
        if (requestAssignmentRepository.existsByRequestIdAndStatus(requestId, AssignmentStatus.ACCEPTED)) {
            throw new BadRequestException("Another staff has already accepted this request");
        }
        if (hasRejectedAssignmentForStaff(requestId, staff.getId())) {
            throw new BadRequestException("You have already rejected this request");
        }

        RescueVehicle vehicle = requireAssignedVehicle(staff);
        RequestAssignment assignment = requestAssignmentRepository
                .findFirstByRequestIdAndStaffIdOrderByAssignedAtDesc(requestId, staff.getId())
                .filter(existing -> existing.getStatus() != AssignmentStatus.REJECTED)
                .orElseGet(() -> RequestAssignment.builder()
                        .request(request)
                        .company(staff.getCompany())
                        .staff(staff)
                        .vehicle(vehicle)
                        .assignedByUser(account)
                        .status(AssignmentStatus.PENDING)
                        .build());

        assignment.setCompany(staff.getCompany());
        assignment.setStaff(staff);
        assignment.setVehicle(vehicle);
        assignment.setAssignedByUser(account);
        assignment.setAcceptedAt(LocalDateTime.now());
        assignment.setRejectedAt(null);
        assignment.setStatus(AssignmentStatus.ACCEPTED);

        RequestAssignment savedAssignment = requestAssignmentRepository.save(assignment);
        rejectOtherPendingAssignments(request, savedAssignment.getId());
        requestSupportService.changeRequestStatus(request, RescueRequestStatus.MATCHED, account, "Accepted by nearby staff");
        staff.setStatus(StaffStatus.BUSY);
        rescueStaffRepository.save(staff);
        return appMapper.toAssignmentResponse(savedAssignment);
    }

    private CompanyDto.StaffStatusResponse toStaffStatusResponse(RescueStaff staff) {
        Address address = staff.getUser() == null ? null : staff.getUser().getDefaultAddress();
        return new CompanyDto.StaffStatusResponse(
                staff.getStatus() == null ? null : staff.getStatus().name(),
                address == null ? null : address.getLatitude(),
                address == null ? null : address.getLongitude(),
                staff.getStatus() == StaffStatus.ACTIVE
        );
    }

    private void validateStaffCanBrowseNearbyRequests(RescueStaff staff) {
        if (staff.getStatus() != StaffStatus.ACTIVE) {
            throw new BadRequestException("Staff must be ONLINE to receive nearby requests");
        }
        requireAssignedVehicle(staff);
        requireStaffCoordinates(staff);
    }

    private Address requireStaffCoordinates(RescueStaff staff) {
        Address staffAddress = staff.getUser() == null ? null : staff.getUser().getDefaultAddress();
        if (staffAddress == null || staffAddress.getLatitude() == null || staffAddress.getLongitude() == null) {
            throw new BadRequestException("Please update your current location first");
        }
        return staffAddress;
    }

    private boolean hasDispatchableLocation(RescueRequest request) {
        return request.getLocation() != null
                && request.getLocation().getLatitude() != null
                && request.getLocation().getLongitude() != null;
    }

    private boolean hasRejectedAssignmentForStaff(Long requestId, Long staffId) {
        return requestAssignmentRepository.findByRequestIdAndStaffIdOrderByAssignedAtDesc(requestId, staffId).stream()
                .anyMatch(assignment -> assignment.getStatus() == AssignmentStatus.REJECTED);
    }

    private NearbyCandidate toNearbyCandidate(RescueRequest request, double staffLatitude, double staffLongitude) {
        double distanceKm = calculateDistance(
                staffLatitude,
                staffLongitude,
                request.getLocation().getLatitude().doubleValue(),
                request.getLocation().getLongitude().doubleValue()
        );
        return new NearbyCandidate(request, distanceKm);
    }

    private double roundDistance(double distanceKm) {
        return BigDecimal.valueOf(distanceKm).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    private void rejectOtherPendingAssignments(RescueRequest request, Long acceptedAssignmentId) {
        LocalDateTime rejectedAt = LocalDateTime.now();
        requestAssignmentRepository.findByRequestIdAndStatus(request.getId(), AssignmentStatus.PENDING)
                .stream()
                .filter(other -> !other.getId().equals(acceptedAssignmentId))
                .forEach(other -> {
                    other.setStatus(AssignmentStatus.REJECTED);
                    other.setRejectedAt(rejectedAt);
                    requestAssignmentRepository.save(other);
                });
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double radiusKm = 6371d;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 2 * radiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private record NearbyCandidate(RescueRequest request, double distanceKm) {
    }
}
