package com.casino.mis.incident.controller;

import com.casino.mis.incident.domain.IncidentType;
import com.casino.mis.incident.dto.CreateIncidentRequest;
import com.casino.mis.incident.dto.IncidentResponse;
import com.casino.mis.incident.mapper.IncidentMapper;
import com.casino.mis.incident.service.IncidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/incident/incidents")
@Tag(name = "Incidents", description = "UC2, UC14: Регистрация и управление инцидентами")
public class IncidentController {

    private final IncidentService service;

    public IncidentController(IncidentService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IncidentResponse create(@RequestBody @Valid CreateIncidentRequest request) {
        return IncidentMapper.toDto(service.create(request));
    }

    @GetMapping
    public List<IncidentResponse> getAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime end,
            @RequestParam(required = false) IncidentType type) {
        
        if (start != null && end != null && type != null) {
            return IncidentMapper.toDtoList(service.findByPeriodAndType(start, end, type));
        } else if (start != null && end != null) {
            return IncidentMapper.toDtoList(service.findByPeriod(start, end));
        } else if (type != null) {
            return IncidentMapper.toDtoList(service.findByType(type));
        }
        return IncidentMapper.toDtoList(service.findAll());
    }

    @GetMapping("/{id}")
    public IncidentResponse getById(@PathVariable UUID id) {
        return IncidentMapper.toDto(service.findById(id));
    }
}

