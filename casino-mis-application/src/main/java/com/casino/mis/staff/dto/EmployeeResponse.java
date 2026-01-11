package com.casino.mis.staff.dto;

import com.casino.mis.staff.domain.Employee;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String middleName;
    private String position;
    private String department;
    private Employee.EmployeeStatus status;
    private OffsetDateTime hireDate;
    private OffsetDateTime createdAt;
    private String contactInfo;
}


