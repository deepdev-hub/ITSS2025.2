package com.itss.vbas.service;

import java.util.List;

import com.itss.vbas.dto.notification.NotificationDto;
import com.itss.vbas.entity.Payment;
import com.itss.vbas.entity.RequestAssignment;
import com.itss.vbas.entity.RescueRequest;

public interface NotificationService {
    List<NotificationDto.NotificationResponse> getMyNotifications();

    NotificationDto.UnreadCountResponse getUnreadCount();

    NotificationDto.NotificationResponse markAsRead(Long notificationId);

    void markAllAsRead();

    void notifyAssignmentAccepted(RequestAssignment assignment);

    void notifyRequestCompleted(RescueRequest request);

    void notifyPaymentPaid(Payment payment);
}
