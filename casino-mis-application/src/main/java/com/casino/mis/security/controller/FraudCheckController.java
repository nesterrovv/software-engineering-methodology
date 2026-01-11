package com.casino.mis.security.controller;

import com.casino.mis.security.dto.FraudCheckRequest;
import com.casino.mis.security.dto.FraudCheckResponse;
import com.casino.mis.security.service.FraudCheckService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/security/fraud-check")
@Tag(name = "Fraud Check", description = "UC6: Сверка с базой мошенников")
public class FraudCheckController {

    private final FraudCheckService service;

    public FraudCheckController(FraudCheckService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Проверить лицо в базе мошенников", description = "UC6: Автоматическая сверка лица с базой мошенников. При совпадении отправляется уведомление (UC7).")
    public FraudCheckResponse checkPerson(@RequestBody @Valid FraudCheckRequest request) {
        return service.performCheck(request);
    }

    @PostMapping("/quick")
    @Operation(summary = "Быстрая проверка", description = "Проверка только по personId")
    public FraudCheckResponse quickCheck(@RequestParam String personId, 
                                        @RequestParam(required = false) UUID activityId) {
        return service.checkPerson(personId, activityId);
    }
}


