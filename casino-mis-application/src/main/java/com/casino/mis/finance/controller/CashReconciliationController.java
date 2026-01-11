package com.casino.mis.finance.controller;

import com.casino.mis.finance.domain.CashRegisterReconciliation;
import com.casino.mis.finance.dto.CashReconciliationRequest;
import com.casino.mis.finance.dto.CashReconciliationResponse;
import com.casino.mis.finance.service.CashReconciliationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/finance/reconciliation")
@Tag(name = "Cash Reconciliation", description = "UC11: Контроль кассы - сверка фактических остатков с расчётным балансом")
public class CashReconciliationController {

    private final CashReconciliationService service;

    public CashReconciliationController(CashReconciliationService service) {
        this.service = service;
    }

    // UC11: Контроль кассы
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Выполнить сверку кассы", description = "UC11: Сравнение фактических остатков с расчётным балансом на основе операций за смену. При расхождении создаётся статус DISCREPANCY_FOUND.")
    public CashReconciliationResponse reconcile(@RequestBody @Valid CashReconciliationRequest request) {
        CashRegisterReconciliation reconciliation = service.reconcileCash(request);
        return toResponse(reconciliation);
    }

    @GetMapping("/{id}")
    public CashReconciliationResponse getById(@PathVariable UUID id) {
        return toResponse(service.findById(id));
    }

    @GetMapping("/cashdesk/{cashDeskId}")
    public List<CashReconciliationResponse> getByCashDesk(@PathVariable UUID cashDeskId) {
        return service.findByCashDeskId(cashDeskId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @PatchMapping("/{id}/status")
    public CashReconciliationResponse updateStatus(
            @PathVariable UUID id,
            @RequestParam CashRegisterReconciliation.ReconciliationStatus status) {
        return toResponse(service.updateStatus(id, status));
    }

    private CashReconciliationResponse toResponse(CashRegisterReconciliation reconciliation) {
        return new CashReconciliationResponse(
                reconciliation.getId(),
                reconciliation.getCashDeskId(),
                reconciliation.getShiftStart(),
                reconciliation.getShiftEnd(),
                reconciliation.getExpectedBalance(),
                reconciliation.getActualBalance(),
                reconciliation.getDiscrepancy(),
                reconciliation.getStatus(),
                reconciliation.getCreatedAt(),
                reconciliation.getNotes()
        );
    }
}

