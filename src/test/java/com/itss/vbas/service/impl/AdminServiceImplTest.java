package com.itss.vbas.service.impl;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.Address;
import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.entity.RequestStatusHistory;
import com.itss.vbas.entity.RescueCompany;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.entity.RescueStaff;
import com.itss.vbas.entity.RescueVehicle;
import com.itss.vbas.enums.RescueVehicleStatus;
import com.itss.vbas.enums.RescueRequestStatus;
import com.itss.vbas.enums.StaffStatus;
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
import com.itss.vbas.service.AssignmentTimeoutService;
import com.itss.vbas.service.NotificationService;
import com.itss.vbas.service.RequestSupportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminServiceImplTest {

    @Mock
    private AccountRepository accountRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private IncidentTypeRepository incidentTypeRepository;
    @Mock
    private ServiceTypeRepository serviceTypeRepository;
    @Mock
    private RescueCompanyRepository rescueCompanyRepository;
    @Mock
    private RescueStaffRepository rescueStaffRepository;
    @Mock
    private RescueVehicleRepository rescueVehicleRepository;
    @Mock
    private RescueRequestRepository rescueRequestRepository;
    @Mock
    private RequestAssignmentRepository requestAssignmentRepository;
    @Mock
    private RequestStatusHistoryRepository requestStatusHistoryRepository;
    @Mock
    private AddressService addressService;
    @Mock
    private RequestSupportService requestSupportService;
    @Mock
    private AssignmentTimeoutService assignmentTimeoutService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AuthContext authContext;
    @Mock
    private AppMapper appMapper;

    private AdminServiceImpl adminService;

    @BeforeEach
    void setUp() {
        adminService = new AdminServiceImpl(
                accountRepository,
                roleRepository,
                incidentTypeRepository,
                serviceTypeRepository,
                rescueCompanyRepository,
                rescueStaffRepository,
                rescueVehicleRepository,
                rescueRequestRepository,
                requestAssignmentRepository,
                requestStatusHistoryRepository,
                addressService,
                requestSupportService,
                assignmentTimeoutService,
                notificationService,
                authContext,
                appMapper
        );
    }

    @Test
    void explicitActorAutoAssignmentDoesNotRequireAuthContext() {
        Account actor = Account.builder().id(73L).fullName("System Admin").build();
        Address requestLocation = Address.builder()
                .latitude(BigDecimal.valueOf(21.0049793))
                .longitude(BigDecimal.valueOf(105.8458536))
                .build();
        RescueRequest request = RescueRequest.builder()
                .id(124L)
                .location(requestLocation)
                .status(RescueRequestStatus.SEARCHING)
                .build();

        RescueCompany company = RescueCompany.builder().id(4L).build();
        Account staffAccount = Account.builder()
                .id(76L)
                .fullName("RapidTow Staff")
                .defaultAddress(Address.builder()
                        .latitude(BigDecimal.valueOf(21.005))
                        .longitude(BigDecimal.valueOf(105.846))
                        .build())
                .build();
        RescueStaff staff = RescueStaff.builder()
                .id(34L)
                .user(staffAccount)
                .company(company)
                .vehicle(RescueVehicle.builder()
                        .id(88L)
                        .company(company)
                        .status(RescueVehicleStatus.AVAILABLE)
                        .build())
                .status(StaffStatus.ACTIVE)
                .build();

        when(rescueRequestRepository.findById(124L)).thenReturn(Optional.of(request));
        when(accountRepository.findById(73L)).thenReturn(Optional.of(actor));
        when(requestAssignmentRepository.findByRequestId(124L)).thenReturn(List.of());
        when(rescueStaffRepository.findAll()).thenReturn(List.of(staff));
        when(requestAssignmentRepository.save(any(RequestAssignment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        adminService.autoAssignNearestStaff(124L, 73L);

        ArgumentCaptor<RequestAssignment> assignmentCaptor = ArgumentCaptor.forClass(RequestAssignment.class);
        verify(requestAssignmentRepository).save(assignmentCaptor.capture());
        assertSame(actor, assignmentCaptor.getValue().getAssignedByUser());
        verify(notificationService).notifyAssignmentPending(any(RequestAssignment.class));

        ArgumentCaptor<RequestStatusHistory> historyCaptor = ArgumentCaptor.forClass(RequestStatusHistory.class);
        verify(requestStatusHistoryRepository).save(historyCaptor.capture());
        assertSame(actor, historyCaptor.getValue().getChangedByUser());
        verify(authContext, never()).getCurrentAccount();
    }
}
