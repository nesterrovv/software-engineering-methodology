package com.casino.incident.controller;

import com.casino.incident.domain.IncidentType;
import com.casino.incident.dto.CreateIncidentRequest;
import com.casino.incident.dto.IncidentResponse;
import com.casino.incident.mapper.IncidentMapper;
import com.casino.incident.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/incidents")
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


