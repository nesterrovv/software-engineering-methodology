package com.casino.mis.incident.controller;

import com.casino.mis.incident.domain.ComplaintCategory;
import com.casino.mis.incident.domain.ComplaintSource;
import com.casino.mis.incident.domain.ComplaintStatus;
import com.casino.mis.incident.dto.ComplaintResponse;
import com.casino.mis.incident.dto.CreateComplaintRequest;
import com.casino.mis.incident.mapper.ComplaintMapper;
import com.casino.mis.incident.service.ComplaintService;
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
@RequestMapping("/api/incident/complaints")
@Tag(name = "Complaints", description = "UC15: Централизованная база жалоб")
public class ComplaintController {

    private final ComplaintService service;

    public ComplaintController(ComplaintService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ComplaintResponse create(@RequestBody @Valid CreateComplaintRequest request) {
        return ComplaintMapper.toDto(service.create(request));
    }

    @GetMapping
    public List<ComplaintResponse> getAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime end,
            @RequestParam(required = false) ComplaintCategory category,
            @RequestParam(required = false) ComplaintSource source) {
        
        if (start != null && end != null && category != null) {
            return ComplaintMapper.toDtoList(service.findByPeriodAndCategory(start, end, category));
        } else if (start != null && end != null) {
            return ComplaintMapper.toDtoList(service.findByPeriod(start, end));
        } else if (category != null) {
            return ComplaintMapper.toDtoList(service.findByCategory(category));
        } else if (source != null) {
            return ComplaintMapper.toDtoList(service.findBySource(source));
        }
        return ComplaintMapper.toDtoList(service.findAll());
    }

    @GetMapping("/{id}")
    public ComplaintResponse getById(@PathVariable UUID id) {
        return ComplaintMapper.toDto(service.findById(id));
    }

    @PatchMapping("/{id}/status")
    public ComplaintResponse updateStatus(@PathVariable UUID id, @RequestParam ComplaintStatus status) {
        return ComplaintMapper.toDto(service.updateStatus(id, status));
    }
}

