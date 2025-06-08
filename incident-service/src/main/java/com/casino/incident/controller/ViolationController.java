package com.casino.incident.controller;

import com.casino.incident.dto.CreateViolationRequest;
import com.casino.incident.dto.ViolationResponse;
import com.casino.incident.mapper.ViolationMapper;
import com.casino.incident.service.ViolationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/violations")
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
}
