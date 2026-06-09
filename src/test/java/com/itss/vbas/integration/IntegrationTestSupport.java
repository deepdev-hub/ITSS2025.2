package com.itss.vbas.integration;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.Address;
import com.itss.vbas.entity.IncidentType;
import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.entity.RescueCompany;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.entity.RescueStaff;
import com.itss.vbas.entity.RescueVehicle;
import com.itss.vbas.entity.Role;
import com.itss.vbas.entity.ServiceType;
import com.itss.vbas.enums.AccountStatus;
import com.itss.vbas.enums.AssignmentStatus;
import com.itss.vbas.enums.CompanyStatus;
import com.itss.vbas.enums.RequestPriority;
import com.itss.vbas.enums.RescueRequestStatus;
import com.itss.vbas.enums.RescueVehicleStatus;
import com.itss.vbas.enums.RoleName;
import com.itss.vbas.enums.StaffStatus;
import com.itss.vbas.repository.AccountRepository;
import com.itss.vbas.repository.AddressRepository;
import com.itss.vbas.repository.IncidentTypeRepository;
import com.itss.vbas.repository.RequestAssignmentRepository;
import com.itss.vbas.repository.RescueCompanyRepository;
import com.itss.vbas.repository.RescueRequestRepository;
import com.itss.vbas.repository.RescueStaffRepository;
import com.itss.vbas.repository.RescueVehicleRepository;
import com.itss.vbas.repository.RoleRepository;
import com.itss.vbas.repository.ServiceTypeRepository;
import com.itss.vbas.security.CurrentUser;
import com.itss.vbas.security.JwtUtil;
import com.itss.vbas.service.AssignmentTimeoutService;
import com.itss.vbas.util.PasswordUtil;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
abstract class IntegrationTestSupport {

    protected static final String PASSWORD = "Password123";

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected JdbcTemplate jdbcTemplate;

    @Autowired
    protected JwtUtil jwtUtil;

    @Autowired
    protected AccountRepository accountRepository;

    @Autowired
    protected AddressRepository addressRepository;

    @Autowired
    protected IncidentTypeRepository incidentTypeRepository;

    @Autowired
    protected ServiceTypeRepository serviceTypeRepository;

    @Autowired
    protected RoleRepository roleRepository;

    @Autowired
    protected RescueCompanyRepository rescueCompanyRepository;

    @Autowired
    protected RescueStaffRepository rescueStaffRepository;

    @Autowired
    protected RescueVehicleRepository rescueVehicleRepository;

    @Autowired
    protected RescueRequestRepository rescueRequestRepository;

    @Autowired
    protected RequestAssignmentRepository requestAssignmentRepository;

    @MockBean
    protected AssignmentTimeoutService assignmentTimeoutService;

    private int sequence;

    @BeforeEach
    void resetIntegrationData() {
        sequence = 1;
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY FALSE");
        for (String table : tablesToClear()) {
            jdbcTemplate.execute("DELETE FROM " + table);
        }
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY TRUE");
        for (RoleName roleName : RoleName.values()) {
            ensureRole(roleName);
        }
    }

    protected String json(Object value) throws JsonProcessingException {
        return objectMapper.writeValueAsString(value);
    }

    protected String bearer(Account account) {
        return "Bearer " + jwtUtil.generateToken(new CurrentUser(
                account.getId(),
                account.getEmail(),
                account.getRole().getRoleName()
        ));
    }

    protected Role ensureRole(RoleName roleName) {
        return roleRepository.findByRoleName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().roleName(roleName).build()));
    }

    protected Account createAdmin() {
        return createAccount(RoleName.ADMIN, "admin" + next() + "@test.local", AccountStatus.ACTIVE, null);
    }

    protected Account createCustomer() {
        return createAccount(RoleName.CUSTOMER, "customer" + next() + "@test.local", AccountStatus.ACTIVE, null);
    }

    protected Account createCustomer(String email) {
        return createAccount(RoleName.CUSTOMER, email, AccountStatus.ACTIVE, null);
    }

    protected Account createCompanyOwner() {
        return createAccount(RoleName.RESCUE_COMPANY, "company" + next() + "@test.local", AccountStatus.ACTIVE, null);
    }

    protected Account createStaffAccount(Address defaultAddress) {
        return createAccount(RoleName.RESCUE_STAFF, "staff" + next() + "@test.local", AccountStatus.ACTIVE, defaultAddress);
    }

    protected Account createAccount(RoleName roleName, String email, AccountStatus status, Address defaultAddress) {
        return accountRepository.save(Account.builder()
                .email(email.trim().toLowerCase())
                .passwordHash(PasswordUtil.hash(PASSWORD))
                .fullName("Test " + roleName.name() + " " + next())
                .phone("0900000000")
                .status(status)
                .role(ensureRole(roleName))
                .defaultAddress(defaultAddress)
                .build());
    }

    protected Address createAddress(double latitude, double longitude) {
        return createAddress(BigDecimal.valueOf(latitude), BigDecimal.valueOf(longitude));
    }

    protected Address createAddress(BigDecimal latitude, BigDecimal longitude) {
        return addressRepository.save(Address.builder()
                .country("Vietnam")
                .province("Ha Noi")
                .district("Cau Giay")
                .ward("Dich Vong")
                .street("Xuan Thuy")
                .detail("Test address " + next())
                .latitude(latitude)
                .longitude(longitude)
                .build());
    }

    protected RescueCompany createCompany(Account ownerAccount) {
        return rescueCompanyRepository.save(RescueCompany.builder()
                .companyName("VBAS Rescue " + next())
                .taxCode("TAX" + next())
                .licenseNumber("LIC" + next())
                .email("company" + next() + "@test.local")
                .phone("0911111111")
                .description("Test rescue company")
                .status(CompanyStatus.APPROVED)
                .ownerAccount(ownerAccount)
                .build());
    }

    protected RescueStaff createStaff(RescueCompany company, StaffStatus status, double latitude, double longitude) {
        Account staffAccount = createStaffAccount(createAddress(latitude, longitude));
        return rescueStaffRepository.save(RescueStaff.builder()
                .user(staffAccount)
                .company(company)
                .jobTitle("Technician")
                .yearsExperience(3)
                .bio("Integration test staff")
                .status(status)
                .build());
    }

    protected RescueVehicle createVehicle(RescueCompany company) {
        return rescueVehicleRepository.save(RescueVehicle.builder()
                .company(company)
                .vehicleCode("VH-" + next())
                .vehicleType("Tow truck")
                .plateNumber("30A-" + next())
                .status(RescueVehicleStatus.AVAILABLE)
                .build());
    }

    protected IncidentType createIncidentType() {
        int value = next();
        return incidentTypeRepository.save(IncidentType.builder()
                .incidentCode("INC_" + value)
                .incidentName("Flat tire " + value)
                .description("Flat tire")
                .build());
    }

    protected ServiceType createServiceType() {
        int value = next();
        ServiceType serviceType = ServiceType.builder()
                .serviceCode("SVC_" + value)
                .serviceName("Tow service " + value)
                .description("Tow service")
                .build();
        serviceType.setBasePrice(BigDecimal.valueOf(100000));
        return serviceTypeRepository.save(serviceType);
    }

    protected RescueRequest createRescueRequest(Account customer, RescueRequestStatus status) {
        return createRescueRequest(customer, status, createIncidentType(), createServiceType(), createAddress(21.0285, 105.8542));
    }

    protected RescueRequest createRescueRequest(
            Account customer,
            RescueRequestStatus status,
            IncidentType incidentType,
            ServiceType serviceType,
            Address location
    ) {
        int value = next();
        return rescueRequestRepository.save(RescueRequest.builder()
                .requestCode("REQ-" + value)
                .customer(customer)
                .incidentType(incidentType)
                .serviceType(serviceType)
                .servicePriceSnapshot(serviceType.getBasePrice())
                .travelCost(BigDecimal.ZERO)
                .feeCoefficient(BigDecimal.valueOf(1.2))
                .estimatedQuotationAmount(serviceType.getBasePrice().multiply(BigDecimal.valueOf(1.2)))
                .location(location)
                .description("Need rescue " + value)
                .priorityLevel(RequestPriority.NORMAL)
                .status(status)
                .build());
    }

    protected RequestAssignment createAssignment(
            RescueRequest request,
            RescueCompany company,
            RescueStaff staff,
            RescueVehicle vehicle,
            Account assignedBy,
            AssignmentStatus status
    ) {
        return requestAssignmentRepository.save(RequestAssignment.builder()
                .request(request)
                .company(company)
                .staff(staff)
                .vehicle(vehicle)
                .assignedByUser(assignedBy)
                .assignedAt(LocalDateTime.now().minusMinutes(1))
                .status(status)
                .build());
    }

    protected Map<String, Object> requestBody(IncidentType incidentType, ServiceType serviceType) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("incidentTypeId", incidentType.getId());
        body.put("serviceTypeId", serviceType.getId());
        body.put("transportCost", 0);
        body.put("description", "Battery failure on the road");
        body.put("priorityLevel", "NORMAL");
        body.put("location", addressBody(21.0285, 105.8542));
        return body;
    }

    protected Map<String, Object> addressBody(double latitude, double longitude) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("country", "Vietnam");
        body.put("province", "Ha Noi");
        body.put("district", "Cau Giay");
        body.put("ward", "Dich Vong");
        body.put("street", "Xuan Thuy");
        body.put("detail", "In front of gate");
        body.put("latitude", latitude);
        body.put("longitude", longitude);
        return body;
    }

    protected MediaType jsonContentType() {
        return MediaType.APPLICATION_JSON;
    }

    private int next() {
        return sequence++;
    }

    private String[] tablesToClear() {
        return new String[] {
                "notifications",
                "messages",
                "reviews",
                "payments",
                "quotes",
                "request_assignments",
                "request_status_history",
                "rescue_requests",
                "customer_vehicles",
                "rescue_vehicles",
                "rescue_staff",
                "rescue_companies",
                "password_reset_tokens",
                "pricing_rules",
                "daily_statistics",
                "account",
                "addresses",
                "incident_types",
                "service_types",
                "roles"
        };
    }
}
