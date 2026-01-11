package com.casino.mis.security.service;

import com.casino.mis.security.domain.FraudDatabase;
import com.casino.mis.security.dto.FraudRecordRequest;
import com.casino.mis.security.repository.FraudDatabaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class FraudDatabaseService {

    private final FraudDatabaseRepository repository;

    public FraudDatabaseService(FraudDatabaseRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public FraudDatabase createRecord(FraudRecordRequest request) {
        FraudDatabase record = new FraudDatabase();
        record.setPersonId(request.getPersonId());
        record.setFullName(request.getFullName());
        record.setDescription(request.getDescription());
        record.setPhotoUrl(request.getPhotoUrl());
        record.setFraudType(request.getFraudType());
        record.setAddedBy(request.getAddedBy() != null ? request.getAddedBy() : UUID.randomUUID());
        record.setStatus(FraudDatabase.FraudStatus.ACTIVE);
        return repository.save(record);
    }

    public FraudDatabase findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fraud record not found: " + id));
    }

    public List<FraudDatabase> findAll() {
        return repository.findAll();
    }

    public List<FraudDatabase> findByType(FraudDatabase.FraudType type) {
        return repository.findByFraudType(type);
    }

    public List<FraudDatabase> search(String searchTerm) {
        return repository.search(searchTerm);
    }

    @Transactional
    public FraudDatabase updateStatus(UUID id, FraudDatabase.FraudStatus status) {
        FraudDatabase record = findById(id);
        record.setStatus(status);
        return repository.save(record);
    }

    @Transactional
    public void delete(UUID id) {
        repository.deleteById(id);
    }
}


