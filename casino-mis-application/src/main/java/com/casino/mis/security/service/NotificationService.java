package com.casino.mis.security.service;

import com.casino.mis.security.domain.Notification;
import com.casino.mis.security.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository repository;

    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    // UC7: Создание уведомления (сохранение в БД + push)
    @Transactional
    public Notification createNotification(UUID recipientId,
                                         Notification.NotificationType type,
                                         String title,
                                         String message,
                                         Notification.NotificationPriority priority,
                                         String relatedEntityType,
                                         UUID relatedEntityId) {
        Notification notification = new Notification();
        notification.setRecipientId(recipientId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setPriority(priority);
        notification.setStatus(Notification.NotificationStatus.PENDING);
        notification.setRelatedEntityType(relatedEntityType);
        notification.setRelatedEntityId(relatedEntityId);

        Notification saved = repository.save(notification);

        // Отправка push уведомления (мок)
        sendPushNotification(saved);

        return saved;
    }

    // Отправка push уведомления (мок реализации)
    private void sendPushNotification(Notification notification) {
        try {
            // В реальной системе здесь был бы вызов push сервиса (FCM, APNS, WebSocket)
            // Для MVP - просто помечаем как отправленное
            notification.setStatus(Notification.NotificationStatus.SENT);
            notification.setSentAt(OffsetDateTime.now());
            repository.save(notification);

            // Логирование (в реальности - отправка через WebSocket или внешний сервис)
            System.out.println("Push notification sent: " + notification.getTitle() + " to " + notification.getRecipientId());
        } catch (Exception e) {
            notification.setStatus(Notification.NotificationStatus.FAILED);
            repository.save(notification);
            System.err.println("Failed to send push notification: " + e.getMessage());
        }
    }

    public List<Notification> findByRecipient(UUID recipientId) {
        return repository.findByRecipientId(recipientId);
    }

    public List<Notification> findUnread(UUID recipientId) {
        return repository.findByRecipientIdAndStatus(recipientId, Notification.NotificationStatus.SENT);
    }

    @Transactional
    public Notification markAsRead(UUID notificationId) {
        Notification notification = repository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));
        notification.setStatus(Notification.NotificationStatus.READ);
        notification.setReadAt(OffsetDateTime.now());
        return repository.save(notification);
    }

    public Long getUnreadCount(UUID recipientId) {
        return repository.countByRecipientIdAndStatus(recipientId, Notification.NotificationStatus.SENT);
    }
}


