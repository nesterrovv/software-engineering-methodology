package com.casino.mis.staff.repository;

import com.casino.mis.staff.domain.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
    Optional<Employee> findById(UUID id);
    List<Employee> findByDepartment(String department);
    List<Employee> findByStatus(Employee.EmployeeStatus status);
}


