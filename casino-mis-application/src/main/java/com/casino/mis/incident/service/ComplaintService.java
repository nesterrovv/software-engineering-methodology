package com.casino.mis.incident.service;

import com.casino.mis.incident.domain.Complaint;
import com.casino.mis.incident.domain.ComplaintCategory;
import com.casino.mis.incident.domain.ComplaintSource;
import com.casino.mis.incident.dto.CreateComplaintRequest;
import com.casino.mis.incident.mapper.ComplaintMapper;
import com.casino.mis.incident.repository.ComplaintRepository;
import com.casino.mis.security.HtmlSanitizer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ComplaintService {

    private final ComplaintRepository repository;
    private final HtmlSanitizer htmlSanitizer;

    public ComplaintService(ComplaintRepository repository, HtmlSanitizer htmlSanitizer) {
        this.repository = repository;
        this.htmlSanitizer = htmlSanitizer;
    }

    @Transactional
    public Complaint create(CreateComplaintRequest request) {
        // Sanitize description to prevent XSS attacks
        if (request.getDescription() != null) {
            request.setDescription(htmlSanitizer.sanitizeToPlainText(request.getDescription()));
        }
        return repository.save(ComplaintMapper.toEntity(request));
    }

    public List<Complaint> findAll() {
        return repository.findAll();
    }

    public Complaint findById(UUID id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Complaint not found: " + id));
    }

    public List<Complaint> findByPeriod(OffsetDateTime start, OffsetDateTime end) {
        return repository.findByReportedAtBetween(start, end);
    }

    public List<Complaint> findByCategory(ComplaintCategory category) {
        return repository.findByCategory(category);
    }

    public List<Complaint> findBySource(ComplaintSource source) {
        return repository.findBySource(source);
    }

    public List<Complaint> findByPeriodAndCategory(OffsetDateTime start, OffsetDateTime end, ComplaintCategory category) {
        return repository.findByReportedAtBetweenAndCategory(start, end, category);
    }

    @Transactional
    public Complaint updateStatus(UUID id, com.casino.mis.incident.domain.ComplaintStatus status) {
        Complaint complaint = findById(id);
        complaint.setStatus(status);
        return repository.save(complaint);
    }
}

