package com.casino.mis.incident.controller;

import com.casino.mis.incident.dto.CreateViolationRequest;
import com.casino.mis.incident.dto.ViolationResponse;
import com.casino.mis.incident.mapper.ViolationMapper;
import com.casino.mis.incident.service.ViolationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/incident/violations")
@Tag(name = "Disciplinary Violations", description = "UC21: Фиксация нарушений дисциплины")
public class ViolationController {

    private final ViolationService service;

    public ViolationController(ViolationService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ViolationResponse create(@RequestBody @Valid CreateViolationRequest request) {
        return ViolationMapper.toDto(service.create(request));
    }

    @GetMapping
    public List<ViolationResponse> all() {
        return ViolationMapper.toDtoList(service.all());
    }

    @GetMapping("/{id}")
    public ViolationResponse one(@PathVariable("id") UUID id) {
        return ViolationMapper.toDto(service.get(id));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Получить нарушения сотрудника", description = "UC22: Получение всех нарушений конкретного сотрудника для просмотра истории")
    public List<ViolationResponse> getByEmployee(@PathVariable UUID employeeId) {
        return ViolationMapper.toDtoList(service.findByEmployeeId(employeeId));
    }
}
