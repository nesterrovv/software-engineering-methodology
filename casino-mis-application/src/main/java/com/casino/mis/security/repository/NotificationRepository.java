package com.casino.mis.security.repository;

import com.casino.mis.security.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByRecipientId(UUID recipientId);
    List<Notification> findByRecipientIdAndStatus(UUID recipientId, Notification.NotificationStatus status);
    List<Notification> findByType(Notification.NotificationType type);
    List<Notification> findByCreatedAtBetween(OffsetDateTime start, OffsetDateTime end);
    List<Notification> findByStatus(Notification.NotificationStatus status);
    Long countByRecipientIdAndStatus(UUID recipientId, Notification.NotificationStatus status);
}


