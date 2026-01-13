package com.casino.mis.finance.controller;

import com.casino.mis.finance.domain.CashOperation;
import com.casino.mis.finance.domain.OperationType;
import com.casino.mis.finance.dto.CashOperationRequest;
import com.casino.mis.finance.service.CashOperationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CashOperationController.class)
class CashOperationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CashOperationService service;

    @Autowired
    private ObjectMapper objectMapper;

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
    @WithMockUser
    void testCreate() throws Exception {
        when(service.create(any(CashOperationRequest.class))).thenReturn(operation);

        mockMvc.perform(post("/api/finance/operations")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(operationId.toString()))
                .andExpect(jsonPath("$.cashDeskId").value(cashDeskId.toString()))
                .andExpect(jsonPath("$.type").value("DEPOSIT"));
    }

    @Test
    @WithMockUser
    void testGetAll() throws Exception {
        when(service.all()).thenReturn(Arrays.asList(operation));

        mockMvc.perform(get("/api/finance/operations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(operationId.toString()));
    }

    @Test
    @WithMockUser
    void testGetById() throws Exception {
        when(service.get(operationId)).thenReturn(operation);

        mockMvc.perform(get("/api/finance/operations/{id}", operationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(operationId.toString()));
    }
}

