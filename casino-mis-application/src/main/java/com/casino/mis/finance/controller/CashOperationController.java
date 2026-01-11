package com.casino.mis.finance.controller;

import com.casino.mis.finance.domain.CashOperation;
import com.casino.mis.finance.dto.CashOperationRequest;
import com.casino.mis.finance.dto.CashOperationResponse;
import com.casino.mis.finance.service.CashOperationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/finance/operations")
@Tag(name = "Cash Operations", description = "UC9: Регистрация финансовых операций")
public class CashOperationController {

    private final CashOperationService service;

    public CashOperationController(CashOperationService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Создать операцию", description = "UC9: Регистрация новой финансовой операции (DEPOSIT или WITHDRAWAL)")
    public CashOperationResponse create(@RequestBody @jakarta.validation.Valid CashOperationRequest req) {
        CashOperation op = service.create(req);
        return new CashOperationResponse(op.getId(), op.getCashDeskId(), op.getAmount(), op.getType(), op.getCurrency(), op.getOperatedAt());
    }

    @GetMapping
    @Operation(summary = "Получить все операции", description = "Получить список всех финансовых операций")
    public List<CashOperationResponse> all() {
        return service.all().stream()
                .map(op -> new CashOperationResponse(op.getId(), op.getCashDeskId(), op.getAmount(), op.getType(), op.getCurrency(), op.getOperatedAt()))
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить операцию по ID", description = "Получить детальную информацию об операции")
    public CashOperationResponse one(@PathVariable("id") UUID id) {
        CashOperation op = service.get(id);
        return new CashOperationResponse(op.getId(), op.getCashDeskId(), op.getAmount(), op.getType(), op.getCurrency(), op.getOperatedAt());
    }
}

