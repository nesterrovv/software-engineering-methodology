package com.casino.mis.finance.service;

import com.casino.mis.finance.domain.CashOperation;
import com.casino.mis.finance.domain.CashRegisterReconciliation;
import com.casino.mis.finance.dto.CashReconciliationRequest;
import com.casino.mis.finance.repository.CashOperationRepository;
import com.casino.mis.finance.repository.CashRegisterReconciliationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CashReconciliationService {

    private final CashRegisterReconciliationRepository reconciliationRepo;
    private final CashOperationRepository operationRepo;

    public CashReconciliationService(CashRegisterReconciliationRepository reconciliationRepo,
                                    CashOperationRepository operationRepo) {
        this.reconciliationRepo = reconciliationRepo;
        this.operationRepo = operationRepo;
    }

    // UC11: Контроль кассы
    @Transactional
    public CashRegisterReconciliation reconcileCash(CashReconciliationRequest request) {
        // Получаем все операции за смену (UC10)
        List<CashOperation> allOperations = operationRepo.findByOperatedAtBetween(
                request.getShiftStart(), 
                request.getShiftEnd()
        );
        List<CashOperation> operations = allOperations.stream()
                .filter(op -> op.getCashDeskId().equals(request.getCashDeskId()))
                .collect(Collectors.toList());

        // Рассчитываем ожидаемый баланс
        BigDecimal expectedBalance = operations.stream()
                .map(op -> {
                    if (op.getType() == com.casino.mis.finance.domain.OperationType.DEPOSIT) {
                        return op.getAmount();
                    } else {
                        return op.getAmount().negate();
                    }
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Вычисляем расхождение
        BigDecimal discrepancy = request.getActualBalance().subtract(expectedBalance);

        // Создаем запись о сверке
        CashRegisterReconciliation reconciliation = new CashRegisterReconciliation();
        reconciliation.setCashDeskId(request.getCashDeskId());
        reconciliation.setShiftStart(request.getShiftStart());
        reconciliation.setShiftEnd(request.getShiftEnd());
        reconciliation.setExpectedBalance(expectedBalance);
        reconciliation.setActualBalance(request.getActualBalance());
        reconciliation.setDiscrepancy(discrepancy);
        reconciliation.setNotes(request.getNotes());

        // Определяем статус на основе расхождения
        if (discrepancy.abs().compareTo(new BigDecimal("0.01")) < 0) {
            reconciliation.setStatus(CashRegisterReconciliation.ReconciliationStatus.CONFIRMED);
        } else {
            reconciliation.setStatus(CashRegisterReconciliation.ReconciliationStatus.DISCREPANCY_FOUND);
        }

        return reconciliationRepo.save(reconciliation);
    }

    public CashRegisterReconciliation findById(UUID id) {
        return reconciliationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Reconciliation not found: " + id));
    }

    public List<CashRegisterReconciliation> findByCashDeskId(UUID cashDeskId) {
        return reconciliationRepo.findByCashDeskId(cashDeskId);
    }

    @Transactional
    public CashRegisterReconciliation updateStatus(UUID id, CashRegisterReconciliation.ReconciliationStatus status) {
        CashRegisterReconciliation reconciliation = findById(id);
        reconciliation.setStatus(status);
        return reconciliationRepo.save(reconciliation);
    }
}

