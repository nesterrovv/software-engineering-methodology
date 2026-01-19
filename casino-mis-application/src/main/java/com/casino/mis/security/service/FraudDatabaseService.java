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
        FraudDatabase fraudRecord = new FraudDatabase();
        fraudRecord.setPersonId(request.getPersonId());
        fraudRecord.setFullName(request.getFullName());
        fraudRecord.setDescription(request.getDescription());
        fraudRecord.setPhotoUrl(request.getPhotoUrl());
        fraudRecord.setFraudType(request.getFraudType());
        fraudRecord.setAddedBy(request.getAddedBy() != null ? request.getAddedBy() : UUID.randomUUID());
        fraudRecord.setStatus(FraudDatabase.FraudStatus.ACTIVE);
        return repository.save(fraudRecord);
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
        FraudDatabase fraudRecord = findById(id);
        fraudRecord.setStatus(status);
        return repository.save(fraudRecord);
    }

    @Transactional
    public void delete(UUID id) {
        repository.deleteById(id);
    }
}


