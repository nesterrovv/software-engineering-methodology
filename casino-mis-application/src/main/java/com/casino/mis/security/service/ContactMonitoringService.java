package com.casino.mis.security.service;

import com.casino.mis.security.client.IncidentServiceClient;
import com.casino.mis.security.domain.ContactEvent;
import com.casino.mis.security.dto.ContactEventRequest;
import com.casino.mis.security.repository.ContactEventRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;

@Service
public class ContactMonitoringService {

    private final ContactEventRepository repository;
    private final FraudCheckService fraudCheckService;
    private final NotificationService notificationService;
    private final IncidentServiceClient incidentServiceClient;

    @Value("${security.contact.max-duration-minutes:10}")
    private Long maxContactDurationMinutes = 10L;

    @Value("${security.contact.max-frequency:5}")
    private Integer maxFrequencyThreshold = 5;

    @Value("${security.contact.time-window-minutes:10}")
    private Long timeWindowMinutes = 10L;

    public ContactMonitoringService(ContactEventRepository repository,
                                   FraudCheckService fraudCheckService,
                                   NotificationService notificationService,
                                   IncidentServiceClient incidentServiceClient) {
        this.repository = repository;
        this.fraudCheckService = fraudCheckService;
        this.notificationService = notificationService;
        this.incidentServiceClient = incidentServiceClient;
    }

    // UC4: Контроль длительности контактов (моки событий)
    @Transactional
    public ContactEvent registerContact(ContactEventRequest request) {
        ContactEvent event = new ContactEvent();
        event.setPersonId1(request.getPersonId1());
        event.setPersonId2(request.getPersonId2());
        event.setContactStartTime(request.getContactStartTime() != null ? 
                request.getContactStartTime() : OffsetDateTime.now());
        event.setContactEndTime(request.getContactEndTime());
        event.setLocation(request.getLocation());

        // Рассчитываем длительность
        if (event.getContactEndTime() != null) {
            Duration duration = Duration.between(event.getContactStartTime(), event.getContactEndTime());
            event.setDurationSeconds(duration.getSeconds());
            event.setStatus(ContactEvent.ContactStatus.ENDED);

            // UC4: Проверка на превышение лимита длительности
            if (duration.toMinutes() > maxContactDurationMinutes) {
                event.setSuspicious(true);
                event.setStatus(ContactEvent.ContactStatus.SUSPICIOUS);
                
                // UC3: Создаём подозрительную активность через Feign
                createSuspiciousActivity(event, "Длительный контакт: " + duration.toMinutes() + " минут");
            }
        } else {
            event.setStatus(ContactEvent.ContactStatus.ACTIVE);
        }

        return repository.save(event);
    }

    // UC5: Контроль частоты взаимодействий
    @Transactional
    public void checkInteractionFrequency(String personId1, String personId2) {
        OffsetDateTime windowStart = OffsetDateTime.now().minusMinutes(timeWindowMinutes);
        List<ContactEvent> recentContacts = repository.findContactsBetweenPersons(personId1, personId2);

        // Фильтруем по временному окну
        long contactsInWindow = recentContacts.stream()
                .filter(ce -> ce.getContactStartTime().isAfter(windowStart))
                .count();

        // UC5: Если частота превышает лимит
        if (contactsInWindow >= maxFrequencyThreshold) {
            ContactEvent latestContact = recentContacts.stream()
                    .max(Comparator.comparing(ContactEvent::getContactStartTime))
                    .orElse(null);

            if (latestContact != null) {
                latestContact.setSuspicious(true);
                latestContact.setStatus(ContactEvent.ContactStatus.SUSPICIOUS);
                repository.save(latestContact);

                // UC3: Создаём подозрительную активность
                createSuspiciousActivity(latestContact, 
                    "Частые взаимодействия: " + contactsInWindow + " контактов за " + timeWindowMinutes + " минут");
            }
        }
    }

    // Генерация моковых событий для тестирования
    @Transactional
    public List<ContactEvent> generateMockContacts(int count) {
        Random random = new Random();
        List<ContactEvent> events = new ArrayList<>();
        
        for (int i = 0; i < count; i++) {
            ContactEventRequest request = new ContactEventRequest();
            request.setPersonId1("PERSON_" + random.nextInt(100));
            request.setPersonId2("PERSON_" + random.nextInt(100));
            request.setContactStartTime(OffsetDateTime.now().minusMinutes(random.nextInt(60)));
            request.setContactEndTime(OffsetDateTime.now().minusMinutes(random.nextInt(30)));
            request.setLocation("Игровой зал, стол " + (random.nextInt(20) + 1));
            
            ContactEvent event = registerContact(request);
            events.add(event);
            
            // Проверяем частоту взаимодействий
            checkInteractionFrequency(request.getPersonId1(), request.getPersonId2());
        }
        
        return events;
    }

    private void createSuspiciousActivity(ContactEvent contactEvent, String description) {
        try {
            Map<String, Object> activityRequest = new HashMap<>();
            activityRequest.put("shortDescription", description);
            activityRequest.put("location", contactEvent.getLocation());
            activityRequest.put("participants", Arrays.asList(contactEvent.getPersonId1(), contactEvent.getPersonId2()));
            activityRequest.put("risk", "HIGH");

            Map<String, Object> created = incidentServiceClient.createSuspiciousActivity(activityRequest);
            UUID activityId = UUID.fromString((String) created.get("id"));
            contactEvent.setSuspiciousActivityId(activityId);
            repository.save(contactEvent);

            // UC6: Сверка с базой мошенников
            fraudCheckService.checkPerson(contactEvent.getPersonId1(), activityId);
            fraudCheckService.checkPerson(contactEvent.getPersonId2(), activityId);

            // UC7: Отправка уведомления
            notificationService.createNotification(
                    UUID.randomUUID(), // В реальности - ID сотрудника службы безопасности
                    com.casino.mis.security.domain.Notification.NotificationType.SUSPICIOUS_ACTIVITY,
                    "Обнаружена подозрительная активность",
                    description + " в " + contactEvent.getLocation(),
                    com.casino.mis.security.domain.Notification.NotificationPriority.HIGH,
                    "SUSPICIOUS_ACTIVITY",
                    activityId
            );
        } catch (Exception e) {
            // Логируем ошибку, но не прерываем процесс
            System.err.println("Error creating suspicious activity: " + e.getMessage());
        }
    }

    public long countSuspiciousContacts() {
        return repository.findBySuspicious(true).size();
    }

    public List<ContactEvent> findSuspiciousContacts() {
        return repository.findBySuspicious(true);
    }
}


