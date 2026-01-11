package com.casino.mis.security.dto;

import com.casino.mis.security.domain.Notification;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationResponse {
    private UUID id;
    private UUID recipientId;
    private Notification.NotificationType type;
    private String title;
    private String message;
    private Notification.NotificationPriority priority;
    private Notification.NotificationStatus status;
    private OffsetDateTime createdAt;
    private OffsetDateTime sentAt;
    private OffsetDateTime readAt;
    private String relatedEntityType;
    private UUID relatedEntityId;
}


