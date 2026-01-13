package com.casino.mis.finance.service;

import com.casino.mis.finance.domain.CashOperation;
import com.casino.mis.finance.domain.OperationType;
import com.casino.mis.finance.dto.CashOperationRequest;
import com.casino.mis.finance.repository.CashOperationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CashOperationServiceTest {

    @Mock
    private CashOperationRepository repository;

    @InjectMocks
    private CashOperationService service;

    private CashOperationRequest request;
    private CashOperation operation;
    private UUID operationId;
    private UUID cashDeskId;

    @BeforeEach
    void setUp() {
        operationId = UUID.randomUUID();
        cashDeskId = UUID.randomUUID();

        request = new CashOperationRequest();
        request.setCashDeskId(cashDeskId);
        request.setAmount(new BigDecimal("1000.00"));
        request.setType(OperationType.DEPOSIT);
        request.setCurrency("USD");

        operation = new CashOperation();
        operation.setId(operationId);
        operation.setCashDeskId(cashDeskId);
        operation.setAmount(new BigDecimal("1000.00"));
        operation.setType(OperationType.DEPOSIT);
        operation.setCurrency("USD");
    }

    @Test
    void testCreate() {
        when(repository.save(any(CashOperation.class))).thenReturn(operation);

        CashOperation result = service.create(request);

        assertNotNull(result);
        assertEquals(operationId, result.getId());
        assertEquals(cashDeskId, result.getCashDeskId());
        assertEquals(OperationType.DEPOSIT, result.getType());
        assertEquals(new BigDecimal("1000.00"), result.getAmount());
        verify(repository, times(1)).save(any(CashOperation.class));
    }

    @Test
    void testCreateWithDefaultCurrency() {
        request.setCurrency(null);
        operation.setCurrency("USD");
        when(repository.save(any(CashOperation.class))).thenReturn(operation);

        CashOperation result = service.create(request);

        assertNotNull(result);
        assertEquals("USD", result.getCurrency());
        verify(repository, times(1)).save(any(CashOperation.class));
    }

    @Test
    void testAll() {
        List<CashOperation> operations = Arrays.asList(operation);
        when(repository.findAll()).thenReturn(operations);

        List<CashOperation> result = service.all();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(operationId, result.get(0).getId());
        verify(repository, times(1)).findAll();
    }

    @Test
    void testGet() {
        when(repository.findById(operationId)).thenReturn(Optional.of(operation));

        CashOperation result = service.get(operationId);

        assertNotNull(result);
        assertEquals(operationId, result.getId());
        verify(repository, times(1)).findById(operationId);
    }

    @Test
    void testGetNotFound() {
        when(repository.findById(operationId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.get(operationId));
        verify(repository, times(1)).findById(operationId);
    }
}

