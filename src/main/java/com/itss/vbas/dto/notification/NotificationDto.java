package com.itss.vbas.dto.notification;

import java.time.LocalDateTime;

public final class NotificationDto {

    private NotificationDto() {
    }

    public record NotificationResponse(
            Long id,
            String type,
            String title,
            String message,
            Long requestId,
            String requestCode,
            boolean read,
            LocalDateTime readAt,
            LocalDateTime createdAt
    ) {
    }

    public record UnreadCountResponse(
            long unreadCount
    ) {
    }
}
