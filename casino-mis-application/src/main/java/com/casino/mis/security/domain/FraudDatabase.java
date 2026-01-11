package com.casino.mis.security.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "fraud_database")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FraudDatabase {

    @Id
    @GeneratedValue
    private UUID id;

    private String personId; // ID лица (может быть внешний ID, документ, и т.д.)

    private String fullName; // Полное имя

    @Column(columnDefinition = "TEXT")
    private String description; // Описание нарушений

    @Column(columnDefinition = "TEXT")
    private String photoUrl; // URL фото (для сравнения)

    @Enumerated(EnumType.STRING)
    private FraudType fraudType; // Тип мошенничества

    private OffsetDateTime addedAt = OffsetDateTime.now();

    private UUID addedBy; // Кто добавил в базу

    private OffsetDateTime lastCheckedAt; // Когда последний раз проверяли

    private Integer matchCount = 0; // Количество совпадений при проверках

    @Enumerated(EnumType.STRING)
    private FraudStatus status = FraudStatus.ACTIVE;

    public enum FraudType {
        CHEATING,      // Мошенничество в играх
        THEFT,         // Кража
        FRAUD,         // Обман
        BANNED,        // Запрещён к допуску
        OTHER          // Другое
    }

    public enum FraudStatus {
        ACTIVE,    // Активная запись
        ARCHIVED   // Архивирована
    }
}


