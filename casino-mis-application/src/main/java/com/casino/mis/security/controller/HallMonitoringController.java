package com.casino.mis.security.controller;

import com.casino.mis.security.domain.HallMonitoring;
import com.casino.mis.security.dto.HallMonitoringResponse;
import com.casino.mis.security.dto.HallStatusResponse;
import com.casino.mis.security.service.HallMonitoringService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/security/monitoring")
@Tag(name = "Hall Monitoring", description = "UC1: Мониторинг зала")
public class HallMonitoringController {

    private final HallMonitoringService service;

    public HallMonitoringController(HallMonitoringService service) {
        this.service = service;
    }

    @PostMapping("/start")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Начать мониторинг зала", description = "UC1: Инициализация сессии мониторинга зала сотрудником службы безопасности")
    public HallMonitoringResponse startMonitoring(@RequestParam UUID securityOfficerId) {
        return toResponse(service.startMonitoring(securityOfficerId));
    }

    @PostMapping("/{id}/end")
    @Operation(summary = "Завершить мониторинг", description = "Завершение сессии мониторинга")
    public HallMonitoringResponse endMonitoring(@PathVariable UUID id) {
        return toResponse(service.endMonitoring(id));
    }

    @GetMapping("/status")
    @Operation(summary = "Получить текущее состояние зала", description = "UC1: Получение визуализации текущей ситуации в зале - количество посетителей, персонала, аномалии")
    public HallStatusResponse getCurrentStatus() {
        return service.getCurrentHallStatus();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить сессию мониторинга", description = "Получение информации о сессии мониторинга")
    public HallMonitoringResponse getById(@PathVariable UUID id) {
        return toResponse(service.findById(id));
    }

    private HallMonitoringResponse toResponse(HallMonitoring monitoring) {
        return new HallMonitoringResponse(
                monitoring.getId(),
                monitoring.getSecurityOfficerId(),
                monitoring.getStartedAt(),
                monitoring.getEndedAt(),
                monitoring.getStatus(),
                monitoring.getActiveVisitors(),
                monitoring.getActiveStaff(),
                monitoring.getAnomaliesDetected(),
                monitoring.getNotes()
        );
    }
}


