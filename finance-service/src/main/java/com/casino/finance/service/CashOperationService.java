package com.casino.finance.service;

import com.casino.finance.domain.CashOperation;
import com.casino.finance.dto.CashOperationRequest;
import com.casino.finance.repository.CashOperationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CashOperationService {

    private final CashOperationRepository repo;

    public CashOperationService(CashOperationRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public CashOperation create(CashOperationRequest req) {
        CashOperation op = new CashOperation();
        op.setCashDeskId(req.getCashDeskId());
        op.setAmount(req.getAmount());
        op.setType(req.getType());
        op.setCurrency(req.getCurrency() != null ? req.getCurrency() : "USD");
        return repo.save(op);
    }

    public List<CashOperation> all() {
        return repo.findAll();
    }

    public CashOperation get(UUID id) {
        return repo.findById(id).orElseThrow();
    }
}
