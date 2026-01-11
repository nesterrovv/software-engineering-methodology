package com.casino.mis.staff.service;

import com.casino.mis.staff.domain.Employee;
import com.casino.mis.staff.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class EmployeeService {

    private final EmployeeRepository repository;

    public EmployeeService(EmployeeRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Employee create(Employee employee) {
        return repository.save(employee);
    }

    public Employee findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + id));
    }

    public List<Employee> findAll() {
        return repository.findAll();
    }

    public List<Employee> findByDepartment(String department) {
        return repository.findByDepartment(department);
    }

    public List<Employee> findByStatus(Employee.EmployeeStatus status) {
        return repository.findByStatus(status);
    }

    @Transactional
    public Employee updateStatus(UUID id, Employee.EmployeeStatus status) {
        Employee employee = findById(id);
        employee.setStatus(status);
        return repository.save(employee);
    }
}


