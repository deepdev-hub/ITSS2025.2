package com.itss.vbas.controller;

import java.util.List;

import com.itss.vbas.dto.common.CommonDto;
import com.itss.vbas.dto.notification.NotificationDto;
import com.itss.vbas.security.RequireAuth;
import com.itss.vbas.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequireAuth
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<CommonDto.ApiResponse<List<NotificationDto.NotificationResponse>>> getMyNotifications() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success(
                "Notifications fetched successfully",
                notificationService.getMyNotifications()
        ));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<CommonDto.ApiResponse<NotificationDto.UnreadCountResponse>> getUnreadCount() {
        return ResponseEntity.ok(CommonDto.ApiResponse.success(
                "Unread notification count fetched successfully",
                notificationService.getUnreadCount()
        ));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<CommonDto.ApiResponse<NotificationDto.NotificationResponse>> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(CommonDto.ApiResponse.success(
                "Notification marked as read",
                notificationService.markAsRead(id)
        ));
    }

    @PutMapping("/read-all")
    public ResponseEntity<CommonDto.ApiResponse<Void>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(CommonDto.ApiResponse.success("Notifications marked as read"));
    }
}
