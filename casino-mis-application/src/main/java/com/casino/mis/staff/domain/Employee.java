package com.casino.mis.staff.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "employees")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Employee {

    @Id
    @GeneratedValue
    private UUID id;

    private String firstName;

    private String lastName;

    private String middleName;

    private String position; // Должность

    private String department; // Подразделение

    @Enumerated(EnumType.STRING)
    private EmployeeStatus status = EmployeeStatus.ACTIVE;

    private OffsetDateTime hireDate;

    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String contactInfo; // Контактная информация

    public enum EmployeeStatus {
        ACTIVE,
        ON_LEAVE,      // В отпуске
        SICK_LEAVE,    // На больничном
        TERMINATED     // Уволен
    }
}


