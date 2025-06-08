package com.casino.finance.controller;

import com.casino.finance.domain.CashOperation;
import com.casino.finance.dto.CashOperationRequest;
import com.casino.finance.dto.CashOperationResponse;
import com.casino.finance.service.CashOperationService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/operations")
public class CashOperationController {

    private final CashOperationService service;

    public CashOperationController(CashOperationService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CashOperationResponse create(@RequestBody CashOperationRequest req) {
        CashOperation op = service.create(req);
        return new CashOperationResponse(op.getId(), op.getCashDeskId(), op.getAmount(), op.getType(), op.getCurrency(), op.getOperatedAt());
    }

    @GetMapping
    public List<CashOperationResponse> all() {
        return service.all().stream()
                .map(op -> new CashOperationResponse(op.getId(), op.getCashDeskId(), op.getAmount(), op.getType(), op.getCurrency(), op.getOperatedAt()))
                .toList();
    }

    @GetMapping("/{id}")
    public CashOperationResponse one(@PathVariable("id") UUID id) {
        CashOperation op = service.get(id);
        return new CashOperationResponse(op.getId(), op.getCashDeskId(), op.getAmount(), op.getType(), op.getCurrency(), op.getOperatedAt());
    }
}
