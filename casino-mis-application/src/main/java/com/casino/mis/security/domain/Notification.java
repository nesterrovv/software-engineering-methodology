package com.casino.mis.security.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID recipientId; // ID получателя (сотрудник службы безопасности)

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Column(columnDefinition = "TEXT")
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationPriority priority = NotificationPriority.NORMAL;

    @Enumerated(EnumType.STRING)
    private NotificationStatus status = NotificationStatus.PENDING;

    private OffsetDateTime createdAt = OffsetDateTime.now();

    private OffsetDateTime sentAt; // Когда отправлено (push)

    private OffsetDateTime readAt; // Когда прочитано

    private String relatedEntityType; // Тип связанной сущности (SUSPICIOUS_ACTIVITY, FRAUD_MATCH, etc.)

    private UUID relatedEntityId; // ID связанной сущности

    @Column(columnDefinition = "TEXT")
    private String metadata; // JSON с дополнительными данными

    public enum NotificationType {
        SUSPICIOUS_ACTIVITY,  // Подозрительная активность (UC3)
        FRAUD_MATCH,          // Совпадение с базой мошенников (UC6)
        LONG_CONTACT,         // Длительный контакт (UC4)
        FREQUENT_INTERACTION, // Частые взаимодействия (UC5)
        SYSTEM_ALERT,         // Системное уведомление
        OTHER                 // Другое
    }

    public enum NotificationPriority {
        LOW,
        NORMAL,
        HIGH,
        CRITICAL
    }

    public enum NotificationStatus {
        PENDING,    // Ожидает отправки
        SENT,       // Отправлено (push)
        DELIVERED,  // Доставлено
        READ,       // Прочитано
        FAILED      // Ошибка доставки
    }
}


