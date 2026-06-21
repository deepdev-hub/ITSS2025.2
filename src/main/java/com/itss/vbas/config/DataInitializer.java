package com.itss.vbas.config;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.Address;
import com.itss.vbas.entity.CustomerVehicle;
import com.itss.vbas.entity.IncidentType;
import com.itss.vbas.entity.RescueCompany;
import com.itss.vbas.entity.RescueStaff;
import com.itss.vbas.entity.RescueVehicle;
import com.itss.vbas.entity.Role;
import com.itss.vbas.entity.ServiceType;
import com.itss.vbas.enums.AccountStatus;
import com.itss.vbas.enums.CompanyStatus;
import com.itss.vbas.enums.RescueVehicleStatus;
import com.itss.vbas.enums.RoleName;
import com.itss.vbas.enums.StaffStatus;
import com.itss.vbas.repository.AccountRepository;
import com.itss.vbas.repository.AddressRepository;
import com.itss.vbas.repository.CustomerVehicleRepository;
import com.itss.vbas.repository.IncidentTypeRepository;
import com.itss.vbas.repository.RescueCompanyRepository;
import com.itss.vbas.repository.RescueStaffRepository;
import com.itss.vbas.repository.RescueVehicleRepository;
import com.itss.vbas.repository.RoleRepository;
import com.itss.vbas.repository.ServiceTypeRepository;
import com.itss.vbas.util.PasswordUtil;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DataInitializer {

    private static final String DEFAULT_COUNTRY = "Vietnam";
    private static final String DEFAULT_PROVINCE = "Ha Noi";
    private static final String DEFAULT_DISTRICT = "Hai Ba Trung";

    @Bean
    CommandLineRunner seedDefaultData(
            RoleRepository roleRepository,
            AccountRepository accountRepository,
            AddressRepository addressRepository,
            CustomerVehicleRepository customerVehicleRepository,
            RescueCompanyRepository rescueCompanyRepository,
            RescueStaffRepository rescueStaffRepository,
            RescueVehicleRepository rescueVehicleRepository,
            IncidentTypeRepository incidentTypeRepository,
            ServiceTypeRepository serviceTypeRepository,
            JdbcTemplate jdbcTemplate
    ) {
        return args -> {
            jdbcTemplate.execute("update account set is_deleted = false where is_deleted is null");
            jdbcTemplate.execute("update incident_types set is_deleted = false where is_deleted is null");
            jdbcTemplate.execute("update service_types set is_deleted = false where is_deleted is null");

            Arrays.stream(RoleName.values())
                    .forEach(roleName -> roleRepository.findByRoleName(roleName)
                            .orElseGet(() -> roleRepository.save(Role.builder().roleName(roleName).build())));

            List<String> supportedRoleNames = Arrays.stream(RoleName.values())
                    .map(Enum::name)
                    .toList();
            String supportedRoleSql = supportedRoleNames.stream()
                    .map(name -> "'" + name + "'")
                    .reduce((left, right) -> left + "," + right)
                    .orElse("''");
            jdbcTemplate.execute("""
                    delete from roles
                    where role_name not in (%s)
                      and id not in (select distinct role_id from account where role_id is not null)
                    """.formatted(supportedRoleSql));

            Account admin = ensureAccount(accountRepository, roleRepository, "admin@vbas.local", "Admin@123", "System Admin", "0900000001", RoleName.ADMIN, "MALE");
            Account customer = ensureAccount(accountRepository, roleRepository, "customer@vbas.local", "Customer@123", "Demo Customer", "0900000002", RoleName.CUSTOMER, "FEMALE");
            Account companyOwner = ensureAccount(accountRepository, roleRepository, "company@vbas.local", "Company@123", "RapidTow Owner", "0900000003", RoleName.RESCUE_COMPANY, "MALE");
            Account primaryStaff = ensureAccount(accountRepository, roleRepository, "staff@vbas.local", "Staff@123", "RapidTow Staff 1", "0900000004", RoleName.RESCUE_STAFF, "MALE");
            Account staff2 = ensureAccount(accountRepository, roleRepository, "staff2@vbas.local", "Staff@123", "RapidTow Staff 2", "0900000005", RoleName.RESCUE_STAFF, "MALE");
            Account staff3 = ensureAccount(accountRepository, roleRepository, "staff3@vbas.local", "Staff@123", "RapidTow Staff 3", "0900000006", RoleName.RESCUE_STAFF, "MALE");
            Account staff4 = ensureAccount(accountRepository, roleRepository, "staff4@vbas.local", "Staff@123", "RapidTow Staff 4", "0900000007", RoleName.RESCUE_STAFF, "MALE");
            Account staff5 = ensureAccount(accountRepository, roleRepository, "staff5@vbas.local", "Staff@123", "RapidTow Staff 5", "0900000008", RoleName.RESCUE_STAFF, "MALE");

            ensureAddress(accountRepository, addressRepository, customer, "Bach Khoa", "Dai Co Viet", "Gan cong vien Thong Nhat", bd("21.0041800"), bd("105.8432300"));
            ensureAddress(accountRepository, addressRepository, primaryStaff, "Bach Khoa", "Tran Dai Nghia", "Staff point 1", bd("21.0074100"), bd("105.8464100"));
            ensureAddress(accountRepository, addressRepository, staff2, "Dong Tam", "Giai Phong", "Staff point 2", bd("21.0008300"), bd("105.8422100"));
            ensureAddress(accountRepository, addressRepository, staff3, "Quynh Loi", "Pho Hue", "Staff point 3", bd("21.0115200"), bd("105.8565400"));
            ensureAddress(accountRepository, addressRepository, staff4, "Phuong Mai", "Truong Chinh", "Staff point 4", bd("20.9986400"), bd("105.8359200"));
            ensureAddress(accountRepository, addressRepository, staff5, "Thanh Nhan", "Kim Nguu", "Staff point 5", bd("21.0132400"), bd("105.8651900"));

            ensureCustomerVehicle(customerVehicleRepository, customer);
            RescueCompany company = ensureCompany(rescueCompanyRepository, companyOwner);

            RescueVehicle vehicle1 = ensureVehicle(rescueVehicleRepository, company, "RT-TRUCK-01", "Tow Truck", "50C-123.45");
            RescueVehicle vehicle2 = ensureVehicle(rescueVehicleRepository, company, "RT-TRUCK-02", "Tow Truck", "50C-123.46");
            RescueVehicle vehicle3 = ensureVehicle(rescueVehicleRepository, company, "RT-TRUCK-03", "Tow Truck", "50C-123.47");
            RescueVehicle vehicle4 = ensureVehicle(rescueVehicleRepository, company, "RT-TRUCK-04", "Tow Truck", "50C-123.48");
            RescueVehicle vehicle5 = ensureVehicle(rescueVehicleRepository, company, "RT-TRUCK-05", "Tow Truck", "50C-123.49");

            ensureStaff(rescueStaffRepository, primaryStaff, company, "Field Technician", vehicle1);
            ensureStaff(rescueStaffRepository, staff2, company, "Field Technician", vehicle2);
            ensureStaff(rescueStaffRepository, staff3, company, "Field Technician", vehicle3);
            ensureStaff(rescueStaffRepository, staff4, company, "Field Technician", vehicle4);
            ensureStaff(rescueStaffRepository, staff5, company, "Field Technician", vehicle5);

            ensureIncidentTypes(incidentTypeRepository);
            ensureServiceTypes(serviceTypeRepository);
        };
    }

    private Account ensureAccount(
            AccountRepository accountRepository,
            RoleRepository roleRepository,
            String email,
            String password,
            String fullName,
            String phone,
            RoleName roleName,
            String gender
    ) {
        Role role = roleRepository.findByRoleName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().roleName(roleName).build()));

        Account account = accountRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> Account.builder()
                        .email(email)
                        .passwordHash(PasswordUtil.hash(password))
                        .fullName(fullName)
                        .phone(phone)
                        .status(AccountStatus.ACTIVE)
                        .role(role)
                        .gender(gender)
                        .build());

        account.setFullName(fullName);
        account.setPhone(phone);
        account.setStatus(AccountStatus.ACTIVE);
        account.setRole(role);
        account.setGender(gender);
        if (account.getPasswordHash() == null || account.getPasswordHash().isBlank()) {
            account.setPasswordHash(PasswordUtil.hash(password));
        }
        return accountRepository.save(account);
    }

    private void ensureAddress(
            AccountRepository accountRepository,
            AddressRepository addressRepository,
            Account account,
            String ward,
            String street,
            String detail,
            BigDecimal latitude,
            BigDecimal longitude
    ) {
        Address address = account.getDefaultAddress();
        if (address == null) {
            address = Address.builder().build();
        }
        address.setCountry(DEFAULT_COUNTRY);
        address.setProvince(DEFAULT_PROVINCE);
        address.setDistrict(DEFAULT_DISTRICT);
        address.setWard(ward);
        address.setStreet(street);
        address.setDetail(detail);
        address.setLatitude(latitude);
        address.setLongitude(longitude);
        Address savedAddress = addressRepository.save(address);
        account.setDefaultAddress(savedAddress);
        accountRepository.save(account);
    }

    private void ensureCustomerVehicle(CustomerVehicleRepository customerVehicleRepository, Account customer) {
        if (customerVehicleRepository.existsByPlateNumberIgnoreCase("51A-888.88")) {
            return;
        }
        customerVehicleRepository.save(CustomerVehicle.builder()
                .customer(customer)
                .brand("Toyota")
                .model("Vios")
                .plateNumber("51A-888.88")
                .manufactureYear(2021)
                .color("White")
                .fuelType("Gasoline")
                .notes("Seed vehicle for demo customer")
                .build());
    }

    private RescueCompany ensureCompany(RescueCompanyRepository rescueCompanyRepository, Account owner) {
        RescueCompany company = rescueCompanyRepository.findByOwnerAccountId(owner.getId())
                .orElseGet(() -> RescueCompany.builder()
                        .ownerAccount(owner)
                        .companyName("RapidTow Rescue")
                        .build());
        company.setCompanyName("RapidTow Rescue");
        company.setTaxCode("TAX-001");
        company.setLicenseNumber("LIC-001");
        company.setEmail("rapidtow@vbas.local");
        company.setPhone("0900000010");
        company.setDescription("Demo rescue company for assignment and quote flow");
        company.setStatus(CompanyStatus.APPROVED);
        company.setOwnerAccount(owner);
        return rescueCompanyRepository.save(company);
    }

    private RescueVehicle ensureVehicle(
            RescueVehicleRepository rescueVehicleRepository,
            RescueCompany company,
            String code,
            String type,
            String plate
    ) {
        RescueVehicle vehicle = rescueVehicleRepository.findByCompanyIdOrderByIdDesc(company.getId()).stream()
                .filter(item -> code.equalsIgnoreCase(item.getVehicleCode()))
                .findFirst()
                .orElseGet(() -> RescueVehicle.builder()
                        .company(company)
                        .vehicleCode(code)
                        .build());
        vehicle.setCompany(company);
        vehicle.setVehicleCode(code);
        vehicle.setVehicleType(type);
        vehicle.setPlateNumber(plate);
        vehicle.setStatus(RescueVehicleStatus.AVAILABLE);
        return rescueVehicleRepository.save(vehicle);
    }

    private void ensureStaff(
            RescueStaffRepository rescueStaffRepository,
            Account staffAccount,
            RescueCompany company,
            String jobTitle,
            RescueVehicle vehicle
    ) {
        RescueStaff staff = rescueStaffRepository.findByUserId(staffAccount.getId())
                .orElseGet(() -> RescueStaff.builder()
                        .user(staffAccount)
                        .company(company)
                        .build());
        staff.setUser(staffAccount);
        staff.setCompany(company);
        staff.setJobTitle(jobTitle);
        staff.setStatus(StaffStatus.ACTIVE);
        staff.setVehicle(vehicle);
        rescueStaffRepository.save(staff);
    }

    private void ensureIncidentTypes(IncidentTypeRepository incidentTypeRepository) {
        if (incidentTypeRepository.findAll().isEmpty()) {
            incidentTypeRepository.saveAll(List.of(
                    IncidentType.builder().incidentCode("FLAT_TIRE").incidentName("Flat Tire").description("Vehicle has a punctured or damaged tire").build(),
                    IncidentType.builder().incidentCode("ENGINE_FAIL").incidentName("Engine Failure").description("Vehicle cannot continue due to engine issue").build(),
                    IncidentType.builder().incidentCode("BATTERY").incidentName("Battery Problem").description("Battery drained or electrical startup problem").build()
            ));
        }
    }

    private void ensureServiceTypes(ServiceTypeRepository serviceTypeRepository) {
        if (serviceTypeRepository.findAll().isEmpty()) {
            serviceTypeRepository.saveAll(List.of(
                    ServiceType.builder().serviceCode("TOWING").serviceName("Towing").description("Tow the vehicle to a garage or safe location").build(),
                    ServiceType.builder().serviceCode("ON_SITE_REPAIR").serviceName("On-site Repair").description("Provide quick rescue or fix at the incident location").build(),
                    ServiceType.builder().serviceCode("BATTERY_SUPPORT").serviceName("Battery Support").description("Jump start or battery emergency handling").build()
            ));
        }
    }

    private BigDecimal bd(String value) {
        return new BigDecimal(value);
    }
}
