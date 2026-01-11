package com.casino.mis.finance.controller;

import com.casino.mis.finance.domain.AnomalousTransaction;
import com.casino.mis.finance.dto.AnomalyDetectionRequest;
import com.casino.mis.finance.dto.AnomalousTransactionResponse;
import com.casino.mis.finance.service.AnomalyDetectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/finance/anomalies")
@Tag(name = "Anomaly Detection", description = "UC12: Выявление аномальных транзакций - алгоритмы анализа операций")
public class AnomalyDetectionController {

    private final AnomalyDetectionService service;

    public AnomalyDetectionController(AnomalyDetectionService service) {
        this.service = service;
    }

    // UC12: Выявление аномальных транзакций
    @PostMapping("/detect")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Обнаружить аномальные транзакции", description = "UC12: Автоматический анализ транзакций с выявлением подозрительных записей по правилам (сумма, частота). Формируется список аномалий с оценкой риска.")
    public List<AnomalousTransactionResponse> detectAnomalies(@RequestBody @Valid AnomalyDetectionRequest request) {
        return service.detectAnomalies(request).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping
    public List<AnomalousTransactionResponse> getAll(
            @RequestParam(required = false) AnomalousTransaction.AnomalyStatus status,
            @RequestParam(required = false) AnomalousTransaction.RiskLevel riskLevel) {
        List<AnomalousTransaction> anomalies;
        if (status != null) {
            anomalies = service.findAll().stream()
                    .filter(a -> a.getStatus() == status)
                    .collect(Collectors.toList());
        } else if (riskLevel != null) {
            anomalies = service.findAll().stream()
                    .filter(a -> a.getRiskLevel() == riskLevel)
                    .collect(Collectors.toList());
        } else {
            anomalies = service.findAll();
        }
        return anomalies.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public AnomalousTransactionResponse getById(@PathVariable UUID id) {
        return toResponse(service.findById(id));
    }

    @PostMapping("/{id}/review")
    @Operation(summary = "Проверить аномалию", description = "Аналитик подтверждает или отклоняет обнаруженную аномалию. Подтверждённые передаются в отчёты (UC17, UC18).")
    public AnomalousTransactionResponse reviewAnomaly(
            @PathVariable UUID id,
            @RequestParam AnomalousTransaction.AnomalyStatus status,
            @RequestParam UUID reviewerId,
            @RequestParam(required = false) String notes) {
        return toResponse(service.reviewAnomaly(id, status, reviewerId, notes));
    }

    private AnomalousTransactionResponse toResponse(AnomalousTransaction anomaly) {
        return new AnomalousTransactionResponse(
                anomaly.getId(),
                anomaly.getCashOperationId(),
                anomaly.getType(),
                anomaly.getRiskLevel(),
                anomaly.getReason(),
                anomaly.getAmount(),
                anomaly.getDetectedAt(),
                anomaly.getStatus(),
                anomaly.getReviewedBy(),
                anomaly.getReviewedAt(),
                anomaly.getReviewerNotes()
        );
    }
}

