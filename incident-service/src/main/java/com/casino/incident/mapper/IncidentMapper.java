package com.casino.incident.mapper;

import com.casino.incident.domain.Incident;
import com.casino.incident.dto.CreateIncidentRequest;
import com.casino.incident.dto.IncidentResponse;

import java.util.List;
import java.util.stream.Collectors;

public class IncidentMapper {

    public static Incident toEntity(CreateIncidentRequest dto) {
        Incident entity = new Incident();
        entity.setType(dto.getType());
        entity.setLocation(dto.getLocation());
        entity.setDescription(dto.getDescription());
        entity.setParticipants(dto.getParticipants());
        entity.setAttachmentUrls(dto.getAttachmentUrls());
        entity.setReportedBy(dto.getReportedBy());
        return entity;
    }

    public static IncidentResponse toDto(Incident entity) {
        return new IncidentResponse(
                entity.getId(),
                entity.getType(),
                entity.getLocation(),
                entity.getOccurredAt(),
                entity.getDescription(),
                entity.getParticipants(),
                entity.getAttachmentUrls(),
                entity.getStatus(),
                entity.getReportedBy()
        );
    }

    public static List<IncidentResponse> toDtoList(List<Incident> list) {
        return list.stream().map(IncidentMapper::toDto).collect(Collectors.toList());
    }
}

