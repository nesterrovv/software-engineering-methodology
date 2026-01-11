package com.casino.mis.staff.dto;

import com.casino.mis.staff.domain.Employee;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeRequest {
    @NotNull
    private String firstName;
    
    @NotNull
    private String lastName;
    
    private String middleName;
    
    @NotNull
    private String position;
    
    @NotNull
    private String department;
    
    private Employee.EmployeeStatus status = Employee.EmployeeStatus.ACTIVE;
    
    private String contactInfo;
}


