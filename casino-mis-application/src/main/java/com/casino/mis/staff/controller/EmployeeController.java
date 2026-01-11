package com.casino.mis.staff.controller;

import com.casino.mis.staff.domain.Employee;
import com.casino.mis.staff.dto.EmployeeRequest;
import com.casino.mis.staff.dto.EmployeeResponse;
import com.casino.mis.staff.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff/employees")
@Tag(name = "Employees", description = "Управление сотрудниками")
public class EmployeeController {

    private final EmployeeService service;

    public EmployeeController(EmployeeService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Создать сотрудника", description = "Добавление нового сотрудника в систему")
    public EmployeeResponse create(@RequestBody @Valid EmployeeRequest request) {
        Employee employee = new Employee();
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setMiddleName(request.getMiddleName());
        employee.setPosition(request.getPosition());
        employee.setDepartment(request.getDepartment());
        employee.setStatus(request.getStatus());
        employee.setHireDate(OffsetDateTime.now());
        employee.setContactInfo(request.getContactInfo());
        return toResponse(service.create(employee));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить сотрудника", description = "Получение информации о сотруднике")
    public EmployeeResponse getById(@PathVariable UUID id) {
        return toResponse(service.findById(id));
    }

    @GetMapping
    @Operation(summary = "Получить всех сотрудников", description = "Список всех сотрудников")
    public List<EmployeeResponse> getAll() {
        return service.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/department/{department}")
    @Operation(summary = "Получить сотрудников по подразделению", description = "Список сотрудников определённого подразделения")
    public List<EmployeeResponse> getByDepartment(@PathVariable String department) {
        return service.findByDepartment(department).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Изменить статус сотрудника", description = "Изменение статуса сотрудника (ACTIVE, ON_LEAVE, etc.)")
    public EmployeeResponse updateStatus(@PathVariable UUID id, @RequestParam Employee.EmployeeStatus status) {
        return toResponse(service.updateStatus(id, status));
    }

    private EmployeeResponse toResponse(Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getMiddleName(),
                employee.getPosition(),
                employee.getDepartment(),
                employee.getStatus(),
                employee.getHireDate(),
                employee.getCreatedAt(),
                employee.getContactInfo()
        );
    }
}


