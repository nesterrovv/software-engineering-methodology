# Casino MIS Backend - Монолитное приложение

Монолитное приложение для управления казино, объединяющее функционал инцидентов и финансов.

## Реализованные Use Cases

### Incident Module (UC14-19, UC21)
* **UC14:** Формирование отчётов по инцидентам
* **UC15:** Централизованная база жалоб
* **UC16:** Повторяющиеся нарушения сотрудников
* **UC17:** Генерация отчётов для руководства
* **UC18:** Генерация отчётов для регуляторов
* **UC19:** Экспорт в PDF / Excel
* **UC21:** Фиксация нарушений дисциплины

### Finance Module (UC9-13)
* **UC9:** Регистрация операций
* **UC10:** Формирование финансовых отчётов
* **UC11:** Контроль кассы
* **UC12:** Выявление аномальных транзакций
* **UC13:** Анализ выигрышей и проигрышей

### Security Module (UC1, UC4-7)
* **UC1:** Мониторинг зала - визуализация состояния зала в реальном времени
* **UC4:** Контроль длительности контактов - отслеживание и выявление длительных контактов
* **UC5:** Контроль частоты взаимодействий - обнаружение подозрительной частоты контактов
* **UC6:** Сверка с базой мошенников - автоматическая проверка лиц в базе данных
* **UC7:** Система автоматических уведомлений - push-уведомления и сохранение в БД

### Staff Module (UC20, UC22-23)
* **UC20:** Учёт времени работы сотрудников - отметки входа/выхода, расчёт отработанного времени
* **UC22:** Просмотр истории нарушений - фильтрация по сотруднику, подразделению, типу, экспорт
* **UC23:** Управление сменами и загрузкой - планирование графиков, учёт доступности, перераспределение

**Примечание:** UC2 (Регистрация инцидентов) и UC3 (Фиксация подозрительной активности) реализованы в Incident Module. UC21 (Фиксация нарушений дисциплины) также реализован в Incident Module.

## Пререквезиты

* JDK 17
* Apache Maven 3.9+
* Docker 28.0+

## Стек

* Spring Boot 3.5.0, Spring Data JPA, Spring Security
* PostgreSQL 14 + Liquibase
* Spring Cloud OpenFeign (для интеграций между модулями)
* Spring WebSocket (для push уведомлений)
* MinIO (S3-compatible)
* iText (PDF экспорт), Apache POI (Excel экспорт)
* Testcontainers, JUnit

## Архитектура

Монолитное приложение с модульной структурой:

```
com.casino.mis
├── finance/          # Финансовый модуль (UC9-13)
│   ├── domain/
│   ├── dto/
│   ├── repository/
│   ├── service/
│   └── controller/
├── incident/         # Модуль инцидентов (UC2, UC3, UC14-19, UC21)
│   ├── domain/
│   ├── dto/
│   ├── repository/
│   ├── service/
│   └── controller/
├── security/         # Модуль безопасности (UC1, UC4-7)
│   ├── domain/
│   ├── dto/
│   ├── repository/
│   ├── service/
│   ├── controller/
│   └── client/       # Feign клиенты для интеграций
├── staff/            # Модуль персонала (UC20, UC22-23)
│   ├── domain/
│   ├── dto/
│   ├── repository/
│   ├── service/
│   ├── controller/
│   └── client/       # Feign клиенты для интеграций
└── config/           # Общие конфигурации
```

## Сборка и запуск

### Локально

```shell
mvn clean package
java -jar casino-mis-application/target/casino-mis-application-1.0.0.jar
```

### Docker Compose

```shell
mvn clean package
docker compose up --build -d
```

## API Endpoints

### Incident Module

- `POST /api/incident/violations` - Создание нарушения
- `GET /api/incident/violations` - Список нарушений
- `GET /api/incident/violations/{id}` - Получение нарушения

- `POST /api/incident/incidents` - Создание инцидента (UC2)
- `GET /api/incident/incidents` - Список инцидентов

- `POST /api/incident/complaints` - Создание жалобы (UC15)
- `GET /api/incident/complaints` - Список жалоб
- `PATCH /api/incident/complaints/{id}/status` - Изменение статуса жалобы

- `POST /api/incident/reports/incidents` - Отчёт по инцидентам (UC14)
- `POST /api/incident/reports/management` - Отчёт для руководства (UC17)
- `POST /api/incident/reports/regulatory` - Отчёт для регуляторов (UC18)
- `POST /api/incident/reports/repeated-violations` - Повторяющиеся нарушения (UC16)
- `GET /api/incident/reports/{id}/export/pdf` - Экспорт в PDF (UC19)
- `GET /api/incident/reports/{id}/export/excel` - Экспорт в Excel (UC19)

### Finance Module

- `POST /api/finance/operations` - Создание операции (UC10)
- `GET /api/finance/operations` - Список операций
- `GET /api/finance/operations/{id}` - Получение операции

- `POST /api/finance/reports` - Генерация финансового отчёта (UC10)

- `POST /api/finance/reconciliation` - Сверка кассы (UC11)
- `GET /api/finance/reconciliation/{id}` - Получение сверки
- `GET /api/finance/reconciliation/cashdesk/{cashDeskId}` - Сверки по кассе
- `PATCH /api/finance/reconciliation/{id}/status` - Изменение статуса сверки

- `POST /api/finance/anomalies/detect` - Обнаружение аномальных транзакций (UC12)
- `GET /api/finance/anomalies` - Список аномалий с фильтрацией
- `GET /api/finance/anomalies/{id}` - Получение аномалии
- `POST /api/finance/anomalies/{id}/review` - Проверка аномалии аналитиком

- `POST /api/finance/game-analysis` - Анализ выигрышей и проигрышей (UC13)
- `GET /api/finance/game-analysis/{id}` - Получение анализа
- `GET /api/finance/game-analysis/table/{gameTableId}` - Анализы по столу

### Security Module

- `POST /api/security/monitoring/start` - Начать мониторинг зала (UC1)
- `GET /api/security/monitoring/status` - Получить текущее состояние зала (UC1)
- `POST /api/security/contacts` - Зарегистрировать контакт (UC4)
- `POST /api/security/contacts/generate-mocks` - Генерировать моковые контакты
- `GET /api/security/contacts/suspicious` - Подозрительные контакты
- `POST /api/security/fraud-database` - Добавить запись в базу мошенников (UC6)
- `GET /api/security/fraud-database` - Список всех записей
- `POST /api/security/fraud-check` - Проверить лицо в базе (UC6)
- `GET /api/security/notifications/recipient/{id}` - Уведомления получателя (UC7)
- `GET /api/security/notifications/recipient/{id}/unread` - Непрочитанные уведомления

### Staff Module

- `POST /api/staff/employees` - Создать сотрудника
- `GET /api/staff/employees` - Список сотрудников
- `POST /api/staff/work-time/clock-in` - Отметка входа (UC20)
- `POST /api/staff/work-time/clock-out` - Отметка выхода (UC20)
- `GET /api/staff/work-time/employee/{id}` - Записи учёта времени сотрудника
- `POST /api/staff/violation-history/search` - Поиск нарушений (UC22)
- `GET /api/staff/violation-history/employee/{id}` - История нарушений сотрудника
- `GET /api/staff/violation-history/department/{dept}` - Нарушения по подразделению
- `POST /api/staff/shifts` - Создать расписание смены (UC23)
- `GET /api/staff/shifts/availability` - Доступность сотрудников
- `POST /api/staff/shifts/{id}/publish` - Опубликовать график
- `POST /api/staff/shifts/{id}/reassign` - Перераспределить смену

## OpenAPI документация (Swagger)

После запуска приложения доступна автоматически сгенерированная OpenAPI документация:

* **Swagger UI:** http://localhost:8080/swagger-ui.html
* **API Docs JSON:** http://localhost:8080/v3/api-docs

Документация включает все endpoints для:
- Finance Module (UC9-13): операции, отчёты, сверка касс, обнаружение аномалий, анализ игр
- Incident Module (UC14-19, UC21): инциденты, жалобы, нарушения, отчёты, экспорт

Все endpoints задокументированы с описаниями, примерами запросов и ответов.

## Проверка работоспособности

### Postman

1. Импортировать окружение: `Casino_MIS_Local_v2.postman_environment.json`
2. Импортировать коллекцию: `Casino_MIS_API_v2.postman_collection.json`
3. Установить переменные:
   - `host_incident`: `http://localhost:8080`
   - `host_finance`: `http://localhost:8080`
4. Выбрать окружение: `Casino MIS Local v2`

Подробное руководство по тестированию см. в `TESTING_GUIDE.md`

### Credentials

* Username: `admin`
* Password: `admin`

## Просмотр логов

```shell
docker compose logs -f casino-mis-application
```

## База данных

* Host: `localhost:5452`
* Database: `casino_mis`
* Username: `root`
* Password: `root`

Схема БД управляется через Liquibase миграции в `casino-mis-application/src/main/resources/db/changelog/`

## MinIO S3 Storage

* Endpoint: `http://localhost:9000`
* Console: `http://localhost:9001`
* Credentials: `minio` / `minio123`

Используется для хранения отчётов и вложений.
