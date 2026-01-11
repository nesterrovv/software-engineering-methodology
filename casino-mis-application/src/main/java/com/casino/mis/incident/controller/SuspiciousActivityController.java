package com.casino.mis.incident.controller;

import com.casino.mis.incident.domain.SuspiciousActivity;
import com.casino.mis.incident.service.SuspiciousActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/incident/suspicious-activities")
@Tag(name = "Suspicious Activities", description = "UC3: Фиксация подозрительной активности")
public class SuspiciousActivityController {

    private final SuspiciousActivityService service;

    public SuspiciousActivityController(SuspiciousActivityService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Создать подозрительную активность", description = "UC3: Фиксация подозрительной активности")
    public Map<String, Object> create(@RequestBody Map<String, Object> request) {
        SuspiciousActivity activity = new SuspiciousActivity();
        activity.setShortDescription((String) request.get("shortDescription"));
        activity.setLocation((String) request.get("location"));
        if (request.get("participants") != null) {
            activity.setParticipants((List<String>) request.get("participants"));
        }
        if (request.get("risk") != null) {
            try {
                String riskStr = request.get("risk").toString().toUpperCase();
                activity.setRisk(SuspiciousActivity.RiskLevel.valueOf(riskStr));
            } catch (Exception e) {
                activity.setRisk(SuspiciousActivity.RiskLevel.MEDIUM);
            }
        } else {
            activity.setRisk(SuspiciousActivity.RiskLevel.MEDIUM);
        }
        
        SuspiciousActivity saved = service.create(activity);
        
        return Map.of(
            "id", saved.getId(),
            "shortDescription", saved.getShortDescription() != null ? saved.getShortDescription() : "",
            "location", saved.getLocation() != null ? saved.getLocation() : "",
            "occurredAt", saved.getOccurredAt(),
            "risk", saved.getRisk().name(),
            "status", saved.getStatus().name()
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить подозрительную активность", description = "Получить детальную информацию")
    public SuspiciousActivity getById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @GetMapping
    @Operation(summary = "Получить все подозрительные активности", description = "Список всех зафиксированных активностей")
    public List<SuspiciousActivity> getAll() {
        return service.findAll();
    }
}

