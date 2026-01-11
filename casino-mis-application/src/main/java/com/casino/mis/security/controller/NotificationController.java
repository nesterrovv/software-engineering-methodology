package com.casino.mis.security.controller;

import com.casino.mis.security.domain.Notification;
import com.casino.mis.security.dto.NotificationResponse;
import com.casino.mis.security.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/security/notifications")
@Tag(name = "Notifications", description = "UC7: Система автоматических уведомлений")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping("/recipient/{recipientId}")
    @Operation(summary = "Получить уведомления получателя", description = "UC7: Получение всех уведомлений для конкретного получателя")
    public List<NotificationResponse> getByRecipient(@PathVariable UUID recipientId) {
        return service.findByRecipient(recipientId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/recipient/{recipientId}/unread")
    @Operation(summary = "Получить непрочитанные уведомления", description = "Список непрочитанных уведомлений")
    public List<NotificationResponse> getUnread(@PathVariable UUID recipientId) {
        return service.findUnread(recipientId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/recipient/{recipientId}/unread-count")
    @Operation(summary = "Количество непрочитанных", description = "Получить количество непрочитанных уведомлений")
    public Long getUnreadCount(@PathVariable UUID recipientId) {
        return service.getUnreadCount(recipientId);
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "Отметить как прочитанное", description = "Пометить уведомление как прочитанное")
    public NotificationResponse markAsRead(@PathVariable UUID id) {
        return toResponse(service.markAsRead(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Создать уведомление", description = "Создание уведомления (для использования другими модулями через Feign)")
    public NotificationResponse create(@RequestBody Map<String, Object> request) {
        UUID recipientId = UUID.fromString(request.get("recipientId").toString());
        Notification.NotificationType type = Notification.NotificationType.valueOf(
                request.get("type").toString());
        String title = request.get("title").toString();
        String message = request.get("message").toString();
        Notification.NotificationPriority priority = Notification.NotificationPriority.valueOf(
                request.get("priority").toString());
        String relatedEntityType = request.get("relatedEntityType") != null ? 
                request.get("relatedEntityType").toString() : null;
        UUID relatedEntityId = request.get("relatedEntityId") != null ? 
                UUID.fromString(request.get("relatedEntityId").toString()) : null;
        
        return toResponse(service.createNotification(recipientId, type, title, message, priority, 
                relatedEntityType, relatedEntityId));
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getRecipientId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getPriority(),
                notification.getStatus(),
                notification.getCreatedAt(),
                notification.getSentAt(),
                notification.getReadAt(),
                notification.getRelatedEntityType(),
                notification.getRelatedEntityId()
        );
    }
}

