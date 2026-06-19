package com.itss.vbas.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import com.itss.vbas.dto.notification.NotificationDto;
import com.itss.vbas.entity.Account;
import com.itss.vbas.entity.Notification;
import com.itss.vbas.entity.Payment;
import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.entity.RescueRequest;
import com.itss.vbas.entity.RescueStaff;
import com.itss.vbas.enums.AssignmentStatus;
import com.itss.vbas.enums.NotificationType;
import com.itss.vbas.exception.ResourceNotFoundException;
import com.itss.vbas.repository.NotificationRepository;
import com.itss.vbas.repository.RequestAssignmentRepository;
import com.itss.vbas.security.AuthContext;
import com.itss.vbas.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final RequestAssignmentRepository requestAssignmentRepository;
    private final AuthContext authContext;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            RequestAssignmentRepository requestAssignmentRepository,
            AuthContext authContext
    ) {
        this.notificationRepository = notificationRepository;
        this.requestAssignmentRepository = requestAssignmentRepository;
        this.authContext = authContext;
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto.NotificationResponse> getMyNotifications() {
        Account account = authContext.getCurrentAccount();
        return notificationRepository.findTop20ByRecipientIdOrderByCreatedAtDesc(account.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationDto.UnreadCountResponse getUnreadCount() {
        Account account = authContext.getCurrentAccount();
        return new NotificationDto.UnreadCountResponse(notificationRepository.countByRecipientIdAndReadFalse(account.getId()));
    }

    @Override
    public NotificationDto.NotificationResponse markAsRead(Long notificationId) {
        Account account = authContext.getCurrentAccount();
        Notification notification = notificationRepository.findByIdAndRecipientId(notificationId, account.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
        markRead(notification, LocalDateTime.now());
        return toResponse(notificationRepository.save(notification));
    }

    @Override
    public void markAllAsRead() {
        Account account = authContext.getCurrentAccount();
        LocalDateTime readAt = LocalDateTime.now();
        notificationRepository.findByRecipientIdAndReadFalseOrderByCreatedAtDesc(account.getId())
                .forEach(notification -> {
                    markRead(notification, readAt);
                    notificationRepository.save(notification);
                });
    }

    @Override
    public void notifyAssignmentPending(RequestAssignment assignment) {
        if (assignment == null
                || assignment.getRequest() == null
                || assignment.getStaff() == null
                || assignment.getStaff().getUser() == null) {
            return;
        }

        RescueRequest request = assignment.getRequest();
        createNotification(
                assignment.getStaff().getUser(),
                NotificationType.ASSIGNMENT_PENDING,
                "Yeu cau moi can xac nhan",
                "Ban vua duoc giao yeu cau " + request.getRequestCode() + ". Hay chap nhan trong vong 60 giay.",
                request
        );
    }

    @Override
    public void notifyAssignmentAccepted(RequestAssignment assignment) {
        if (assignment == null || assignment.getRequest() == null || assignment.getRequest().getCustomer() == null) {
            return;
        }

        RescueRequest request = assignment.getRequest();
        String staffName = assignment.getStaff() == null || assignment.getStaff().getUser() == null
                ? "Rescue staff"
                : assignment.getStaff().getUser().getFullName();
        createNotification(
                request.getCustomer(),
                NotificationType.ASSIGNMENT_ACCEPTED,
                "Staff accepted the request",
                staffName + " has accepted request " + request.getRequestCode() + ".",
                request
        );
    }

    @Override
    public void notifyRequestCompleted(RescueRequest request) {
        if (request == null || request.getCustomer() == null) {
            return;
        }

        createNotification(
                request.getCustomer(),
                NotificationType.REQUEST_COMPLETED,
                "Rescue request completed",
                "Request " + request.getRequestCode() + " has been marked as completed by staff.",
                request
        );
    }

    @Override
    public void notifyPaymentPaid(Payment payment) {
        if (payment == null || payment.getRequest() == null) {
            return;
        }

        requestAssignmentRepository.findFirstByRequestIdOrderByAssignedAtDesc(payment.getRequest().getId())
                .filter(assignment -> assignment.getStatus() != AssignmentStatus.REJECTED)
                .map(RequestAssignment::getStaff)
                .map(RescueStaff::getUser)
                .ifPresent(staffUser -> createNotification(
                        staffUser,
                        NotificationType.PAYMENT_PAID,
                        "Customer has paid",
                        "Customer has paid for request " + payment.getRequest().getRequestCode() + ".",
                        payment.getRequest()
                ));
    }

    private void createNotification(
            Account recipient,
            NotificationType type,
            String title,
            String message,
            RescueRequest request
    ) {
        if (recipient == null) {
            return;
        }
        notificationRepository.save(Notification.builder()
                .recipient(recipient)
                .type(type)
                .title(title)
                .message(message)
                .request(request)
                .read(false)
                .build());
    }

    private void markRead(Notification notification, LocalDateTime readAt) {
        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(readAt);
        }
    }

    private NotificationDto.NotificationResponse toResponse(Notification notification) {
        RescueRequest request = notification.getRequest();
        return new NotificationDto.NotificationResponse(
                notification.getId(),
                notification.getType().name(),
                notification.getTitle(),
                notification.getMessage(),
                request == null ? null : request.getId(),
                request == null ? null : request.getRequestCode(),
                notification.isRead(),
                notification.getReadAt(),
                notification.getCreatedAt()
        );
    }
}
