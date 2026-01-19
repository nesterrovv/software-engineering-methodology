# Справочные эндпоинты для фронтенда

## Обзор

Реализованы эндпоинты для получения списков справочных данных, которые фронтенд может использовать для заполнения выпадающих списков и получения UUID/ID для использования в других API запросах.

## Эндпоинты

### 1. GET /api/reference/cashdesks

**Описание**: Получить список всех касс

**Аутентификация**: Basic Auth (admin/admin)

**Ответ**:
```json
[
  {
    "id": "11111111-1111-1111-1111-111111111111",
    "name": "Касса №1",
    "location": "Главный зал",
    "status": "ACTIVE"
  },
  ...
]
```

**Использование**: ID касс используется в параметре `cashDeskId` при создании финансовых операций.

### 2. GET /api/reference/gametables

**Описание**: Получить список всех игровых столов и автоматов

**Аутентификация**: Basic Auth (admin/admin)

**Ответ**:
```json
[
  {
    "id": "TABLE-001",
    "name": "Рулетка №1",
    "gameType": "ROULETTE",
    "location": "Главный зал",
    "status": "ACTIVE"
  },
  ...
]
```

**Использование**: ID столов используется в параметре `gameTableId` при анализе игровых сессий.

### 3. GET /api/staff/shifts

**Описание**: Получить список смен за период

**Аутентификация**: Basic Auth (admin/admin)

**Параметры**:
- `startDate` (required): Начало периода (формат: YYYY-MM-DD)
- `endDate` (required): Конец периода (формат: YYYY-MM-DD)

**Пример запроса**:
```
GET /api/staff/shifts?startDate=2025-01-01&endDate=2025-01-31
```

**Ответ**:
```json
[
  {
    "id": "43fab7a7-7dcd-49ed-88a6-e6a6a953c48c",
    "employeeId": "57fb4fa0-e0f1-4218-89df-9c2c8377c957",
    "shiftDate": "2025-01-20",
    "plannedStartTime": "2025-01-20T08:00:00Z",
    "plannedEndTime": "2025-01-20T16:00:00Z",
    "status": "PUBLISHED",
    "shiftType": "DAY",
    "location": "Игровой зал",
    ...
  }
]
```

**Использование**: ID смен используется при работе с расписанием сотрудников.

## Тестирование

### Запуск тестового скрипта

```bash
./test-reference-endpoints.sh
```

Скрипт проверяет:
- ✓ Доступность всех эндпоинтов
- ✓ Корректность формата ответов
- ✓ Возможность использования полученных UUID в других запросах

### Postman коллекция

Эндпоинты добавлены в коллекцию `Casino_MIS_API_v2.postman_collection.json`:
- Модуль **"Reference Data"** содержит эндпоинты для касс и столов
- Модуль **"Staff Module / UC23: Shift Management"** содержит эндпоинты для смен

## Реализация

**Контроллер**: `casino-mis-application/src/main/java/com/casino/mis/reference/controller/ReferenceController.java`

**DTO**:
- `CashDeskInfo.java`
- `GameTableInfo.java`

**Особенности**:
- Данные хардкодные (для разработки и тестирования)
- UUID касс фиксированные для обеспечения воспроизводимости тестов
- ID столов в формате строк (TABLE-XXX, SLOT-XXX)

## Примеры использования

### Создание финансовой операции с использованием ID кассы

```bash
# 1. Получить список касс
curl -u admin:admin http://localhost:8080/api/reference/cashdesks

# 2. Использовать ID кассы при создании операции
curl -u admin:admin -X POST http://localhost:8080/api/finance/operations \
  -H "Content-Type: application/json" \
  -d '{
    "cashDeskId": "11111111-1111-1111-1111-111111111111",
    "amount": 1000.00,
    "type": "DEPOSIT",
    "currency": "RUB"
  }'
```

### Анализ игровой сессии с использованием ID стола

```bash
# 1. Получить список столов
curl -u admin:admin http://localhost:8080/api/reference/gametables

# 2. Создать запрос на анализ игровой сессии
curl -u admin:admin -X POST http://localhost:8080/api/finance/game-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "gameTableId": "TABLE-001",
    "startTime": "2025-01-01T00:00:00",
    "endTime": "2025-01-31T23:59:59"
  }'
```
