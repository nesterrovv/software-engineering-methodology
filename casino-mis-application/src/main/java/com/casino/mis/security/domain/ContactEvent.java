package com.casino.mis.security.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "contact_events")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContactEvent {

    @Id
    @GeneratedValue
    private UUID id;

    private String personId1; // ID первого участника контакта

    private String personId2; // ID второго участника контакта

    private OffsetDateTime contactStartTime; // Время начала контакта

    private OffsetDateTime contactEndTime; // Время окончания контакта

    private Long durationSeconds; // Длительность контакта в секундах

    private String location; // Место контакта (например, "Игровой зал, стол 5")

    @Enumerated(EnumType.STRING)
    private ContactStatus status = ContactStatus.ACTIVE;

    private Boolean suspicious = false; // Флаг подозрительности

    private UUID suspiciousActivityId; // Ссылка на UC3 (если создана подозрительная активность)

    public enum ContactStatus {
        ACTIVE,    // Контакт продолжается
        ENDED,     // Контакт завершён нормально
        SUSPICIOUS // Контакт помечен как подозрительный
    }
}


