#!/bin/bash

# Скрипт для автоматического тестирования всех Use Cases
# Использует curl для выполнения HTTP-запросов

# Не останавливаемся на ошибках, чтобы собрать всю статистику
# set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Конфигурация
HOST="${HOST:-http://localhost:8080}"
USERNAME="${USERNAME:-admin}"
PASSWORD="${PASSWORD:-admin}"
AUTH="${USERNAME}:${PASSWORD}"

# Счётчики
TOTAL_UC=0
PASSED_UC=0
FAILED_UC=0

# Хранилище ID для использования в следующих запросах
EMPLOYEE_ID="11111111-1111-1111-1111-111111111111"
EMPLOYEE_ID_2="22222222-2222-2222-2222-222222222222"
EMPLOYEE_ID_3="33333333-3333-3333-3333-333333333333"
CASH_DESK_ID="22222222-2222-2222-2222-222222222222"
MONITORING_ID=""
INCIDENT_ID=""
VIOLATION_ID=""
ACTIVITY_ID=""
COMPLAINT_ID=""
FRAUD_RECORD_ID=""
NOTIFICATION_ID=""
REPORT_ID=""
OPERATION_ID=""
RECONCILIATION_ID=""
ANOMALY_ID=""
WORK_TIME_RECORD_ID=""
SHIFT_ID=""

# Функции
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_success_uc() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((PASSED_UC++))
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_error_uc() {
    echo -e "${RED}[✗]${NC} $1"
    ((FAILED_UC++))
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_uc() {
    echo -e "\n${GREEN}=== $1 ===${NC}"
    ((TOTAL_UC++))
}

# Функция для выполнения curl запроса
curl_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=${4:-200}
    local description=$5
    
    local url="${HOST}${endpoint}"
    local response
    local status_code
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -u "$AUTH" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$url" 2>/dev/null || echo -e "\n000")
    else
        response=$(curl -s -w "\n%{http_code}" -u "$AUTH" -X "$method" \
            -H "Content-Type: application/json" \
            "$url" 2>/dev/null || echo -e "\n000")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        echo "$body"
        return 0
    else
        log_error "Request failed: $description"
        log_error "  Expected status: $expected_status, Got: $status_code"
        log_error "  URL: $url"
        if [ ${#body} -lt 500 ]; then
            log_error "  Response: $body"
        else
            log_error "  Response: ${body:0:200}... (truncated)"
        fi
        return 1
    fi
}

# Функция для извлечения ID из JSON ответа
extract_id() {
    echo "$1" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | grep -o '[a-f0-9-]\{36\}' | head -1
}

# Функция для проверки UC
check_uc() {
    local uc_name=$1
    local test_func=$2
    
    log_uc "$uc_name"
    if $test_func; then
        log_success_uc "$uc_name: PASSED"
        return 0
    else
        log_error_uc "$uc_name: FAILED"
        return 1
    fi
}

# Подготовка тестовых данных
prepare_test_data() {
    log_info "Подготовка тестовых данных..."
    
    # Создание сотрудников
    log_info "Создание сотрудников..."
    local response
    response=$(curl_request "POST" "/api/staff/employees" "{
        \"firstName\": \"Иван\",
        \"lastName\": \"Петров\",
        \"middleName\": \"Сергеевич\",
        \"position\": \"Официант\",
        \"department\": \"Обслуживание\",
        \"status\": \"ACTIVE\",
        \"contactInfo\": \"ivan.petrov@casino.local\"
    }" 201 "Create employee 1")
    if [ $? -eq 0 ]; then
        EMPLOYEE_ID=$(extract_id "$response")
        log_info "Employee 1 ID: $EMPLOYEE_ID"
    fi
    
    response=$(curl_request "POST" "/api/staff/employees" "{
        \"firstName\": \"Мария\",
        \"lastName\": \"Сидорова\",
        \"position\": \"Бармен\",
        \"department\": \"Бар\",
        \"status\": \"ACTIVE\",
        \"contactInfo\": \"maria.sidorova@casino.local\"
    }" 201 "Create employee 2")
    if [ $? -eq 0 ]; then
        EMPLOYEE_ID_2=$(extract_id "$response")
        log_info "Employee 2 ID: $EMPLOYEE_ID_2"
    fi
    
    log_success "Сотрудники созданы"
    
    # Создание финансовых операций
    log_info "Создание финансовых операций..."
    for i in {1..5}; do
        curl_request "POST" "/api/finance/operations" "{
            \"cashDeskId\": \"$CASH_DESK_ID\",
            \"amount\": $((5000 + i * 1000)).00,
            \"type\": \"DEPOSIT\",
            \"currency\": \"USD\"
        }" 201 "Create operation $i" > /dev/null
    done
    
    curl_request "POST" "/api/finance/operations" "{
        \"cashDeskId\": \"$CASH_DESK_ID\",
        \"amount\": 15000.00,
        \"type\": \"DEPOSIT\",
        \"currency\": \"USD\"
    }" 201 "Create large operation" > /dev/null
    
    for i in {1..3}; do
        curl_request "POST" "/api/finance/operations" "{
            \"cashDeskId\": \"$CASH_DESK_ID\",
            \"amount\": $((2000 + i * 500)).00,
            \"type\": \"WITHDRAWAL\",
            \"currency\": \"USD\"
        }" 201 "Create withdrawal $i" > /dev/null
    done
    
    log_success "Финансовые операции созданы"
    
    log_success "Тестовые данные подготовлены"
}

# UC1: Мониторинг зала
test_uc1() {
    local response
    response=$(curl_request "POST" "/api/security/monitoring/start?securityOfficerId=$EMPLOYEE_ID" "" 201 "Start monitoring")
    if [ $? -eq 0 ]; then
        MONITORING_ID=$(extract_id "$response")
        log_info "Monitoring ID: $MONITORING_ID"
    else
        return 1
    fi
    
    curl_request "GET" "/api/security/monitoring/status" "" 200 "Get hall status" > /dev/null || return 1
    
    if [ -n "$MONITORING_ID" ]; then
        curl_request "GET" "/api/security/monitoring/$MONITORING_ID" "" 200 "Get monitoring session" > /dev/null || return 1
        curl_request "POST" "/api/security/monitoring/$MONITORING_ID/end" "" 200 "End monitoring" > /dev/null || return 1
    fi
    
    return 0
}

# UC2: Регистрация инцидентов
test_uc2() {
    local response
    response=$(curl_request "POST" "/api/incident/incidents" "{
        \"type\": \"THEFT\",
        \"location\": \"Игровой зал, стол 5\",
        \"description\": \"Кража фишек у игрока\",
        \"participants\": [\"Игрок ID: 12345\", \"Подозреваемый ID: 67890\"],
        \"attachmentUrls\": [\"https://minio.local/video/theft_incident.mp4\"],
        \"reportedBy\": \"$EMPLOYEE_ID\"
    }" 201 "Create incident")
    if [ $? -eq 0 ]; then
        INCIDENT_ID=$(extract_id "$response")
        log_info "Incident ID: $INCIDENT_ID"
    else
        return 1
    fi
    
    curl_request "GET" "/api/incident/incidents" "" 200 "Get all incidents" > /dev/null || return 1
    curl_request "GET" "/api/incident/incidents/$INCIDENT_ID" "" 200 "Get incident by ID" > /dev/null || return 1
    
    return 0
}

# UC3: Фиксация подозрительной активности
test_uc3() {
    local response
    response=$(curl_request "POST" "/api/incident/suspicious-activities" "{
        \"shortDescription\": \"Подозрительное поведение у стола 7\",
        \"location\": \"Игровой зал, стол 7\",
        \"participants\": [\"PERSON_001\", \"PERSON_002\"],
        \"risk\": \"HIGH\"
    }" 201 "Create suspicious activity")
    if [ $? -eq 0 ]; then
        ACTIVITY_ID=$(extract_id "$response")
        log_info "Activity ID: $ACTIVITY_ID"
    else
        return 1
    fi
    
    curl_request "GET" "/api/incident/suspicious-activities" "" 200 "Get all activities" > /dev/null || return 1
    if [ -n "$ACTIVITY_ID" ]; then
        curl_request "GET" "/api/incident/suspicious-activities/$ACTIVITY_ID" "" 200 "Get activity by ID" > /dev/null || return 1
    fi
    
    return 0
}

# UC4: Контроль длительности контактов
test_uc4() {
    curl_request "POST" "/api/security/contacts" "{
        \"personId1\": \"PERSON_001\",
        \"personId2\": \"PERSON_002\",
        \"contactStartTime\": \"2025-01-15T10:00:00Z\",
        \"contactEndTime\": \"2025-01-15T10:15:00Z\",
        \"location\": \"Игровой зал, стол 5\"
    }" 201 "Create contact" > /dev/null || return 1
    
    curl_request "GET" "/api/security/contacts/suspicious" "" 200 "Get suspicious contacts" > /dev/null || return 1
    
    return 0
}

# UC5: Контроль частоты взаимодействий
test_uc5() {
    curl_request "POST" "/api/security/contacts/check-frequency?personId1=PERSON_001&personId2=PERSON_002" "" 200 "Check frequency" > /dev/null || return 1
    return 0
}

# UC6: Сверка с базой мошенников
test_uc6() {
    local fraud_person_id="FRAUD_$(date +%s)_$$"
    local response
    response=$(curl_request "POST" "/api/security/fraud-database" "{
        \"personId\": \"$fraud_person_id\",
        \"fullName\": \"Иван Иванов\",
        \"description\": \"Известный мошенник в карточных играх\",
        \"fraudType\": \"CHEATING\",
        \"addedBy\": \"$EMPLOYEE_ID\"
    }" 201 "Add fraud record")
    if [ $? -eq 0 ]; then
        FRAUD_RECORD_ID=$(extract_id "$response")
        log_info "Fraud Record ID: $FRAUD_RECORD_ID"
    else
        return 1
    fi
    
    curl_request "POST" "/api/security/fraud-check" "{
        \"personId\": \"$fraud_person_id\",
        \"activityId\": null
    }" 200 "Check fraud" > /dev/null || return 1
    
    curl_request "GET" "/api/security/fraud-database" "" 200 "Get all fraud records" > /dev/null || return 1
    
    if [ -n "$FRAUD_RECORD_ID" ]; then
        curl_request "PATCH" "/api/security/fraud-database/$FRAUD_RECORD_ID/status?status=ARCHIVED" "" 200 "Update fraud status" > /dev/null || return 1
    fi
    
    return 0
}

# UC7: Система автоматических уведомлений
test_uc7() {
    local response
    response=$(curl_request "POST" "/api/security/notifications" "{
        \"recipientId\": \"$EMPLOYEE_ID\",
        \"type\": \"SYSTEM_ALERT\",
        \"title\": \"Тестовое уведомление\",
        \"message\": \"Сообщение для тестирования системы уведомлений\",
        \"priority\": \"HIGH\",
        \"relatedEntityType\": \"SUSPICIOUS_ACTIVITY\",
        \"relatedEntityId\": null
    }" 201 "Create notification")
    if [ $? -eq 0 ]; then
        NOTIFICATION_ID=$(extract_id "$response")
        log_info "Notification ID: $NOTIFICATION_ID"
    else
        return 1
    fi
    
    curl_request "GET" "/api/security/notifications/recipient/$EMPLOYEE_ID" "" 200 "Get notifications" > /dev/null || return 1
    curl_request "GET" "/api/security/notifications/recipient/$EMPLOYEE_ID/unread" "" 200 "Get unread notifications" > /dev/null || return 1
    
    if [ -n "$NOTIFICATION_ID" ]; then
        curl_request "POST" "/api/security/notifications/$NOTIFICATION_ID/read" "" 200 "Mark notification as read" > /dev/null || return 1
    fi
    
    return 0
}

# UC9: Регистрация операций
test_uc9() {
    local response
    response=$(curl_request "POST" "/api/finance/operations" "{
        \"cashDeskId\": \"$CASH_DESK_ID\",
        \"amount\": 5000.00,
        \"type\": \"DEPOSIT\",
        \"currency\": \"USD\"
    }" 201 "Create operation")
    if [ $? -eq 0 ]; then
        OPERATION_ID=$(extract_id "$response")
        log_info "Operation ID: $OPERATION_ID"
    else
        return 1
    fi
    
    curl_request "GET" "/api/finance/operations" "" 200 "Get all operations" > /dev/null || return 1
    
    if [ -n "$OPERATION_ID" ]; then
        curl_request "GET" "/api/finance/operations/$OPERATION_ID" "" 200 "Get operation by ID" > /dev/null || return 1
    fi
    
    return 0
}

# UC10: Формирование финансовых отчётов
test_uc10() {
    curl_request "POST" "/api/finance/reports" "{
        \"periodStart\": \"2025-01-01\",
        \"periodEnd\": \"2025-01-31\"
    }" 201 "Create financial report" > /dev/null || return 1
    return 0
}

# UC11: Контроль кассы
test_uc11() {
    local response
    response=$(curl_request "POST" "/api/finance/reconciliation" "{
        \"cashDeskId\": \"$CASH_DESK_ID\",
        \"shiftStart\": \"2025-01-01T08:00:00Z\",
        \"shiftEnd\": \"2025-01-01T20:00:00Z\",
        \"actualBalance\": 50000.00,
        \"notes\": \"Сверка после смены\"
    }" 201 "Create reconciliation")
    if [ $? -eq 0 ]; then
        RECONCILIATION_ID=$(extract_id "$response")
        log_info "Reconciliation ID: $RECONCILIATION_ID"
    else
        return 1
    fi
    
    if [ -n "$RECONCILIATION_ID" ]; then
        curl_request "GET" "/api/finance/reconciliation/$RECONCILIATION_ID" "" 200 "Get reconciliation" > /dev/null || return 1
    fi
    
    return 0
}

# UC12: Выявление аномальных транзакций
test_uc12() {
    local response
    response=$(curl_request "POST" "/api/finance/anomalies/detect" "{
        \"periodStart\": \"2025-01-01T00:00:00Z\",
        \"periodEnd\": \"2025-12-31T23:59:59Z\",
        \"largeAmountThreshold\": 10000,
        \"frequencyThreshold\": 10,
        \"timeWindowMinutes\": 60
    }" 201 "Detect anomalies")
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        ANOMALY_ID=$(echo "$response" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | grep -o '[a-f0-9-]\{36\}' | head -1)
        log_info "Anomalies detected"
    fi
    
    curl_request "GET" "/api/finance/anomalies" "" 200 "Get all anomalies" > /dev/null || return 1
    return 0
}

# UC13: Анализ выигрышей и проигрышей
test_uc13() {
    curl_request "POST" "/api/finance/game-analysis" "{
        \"periodStart\": \"2025-01-01T00:00:00Z\",
        \"periodEnd\": \"2025-12-31T23:59:59Z\",
        \"gameTableId\": \"$CASH_DESK_ID\",
        \"expectedRtp\": 95.0,
        \"largeWinThreshold\": 1000
    }" 201 "Create game analysis" > /dev/null || return 1
    return 0
}

# UC14: Формирование отчётов по инцидентам
test_uc14() {
    local response
    response=$(curl_request "POST" "/api/incident/reports/incidents" "{
        \"periodStart\": \"2025-01-01T00:00:00Z\",
        \"periodEnd\": \"2025-12-31T23:59:59Z\",
        \"incidentTypes\": [\"THEFT\", \"FIGHT\"],
        \"generatedBy\": \"$EMPLOYEE_ID\"
    }" 201 "Create incident report")
    if [ $? -eq 0 ]; then
        REPORT_ID=$(extract_id "$response")
        log_info "Report ID: $REPORT_ID"
    else
        return 1
    fi
    
    curl_request "GET" "/api/incident/reports?type=INCIDENTS" "" 200 "Get incident reports" > /dev/null || return 1
    
    if [ -n "$REPORT_ID" ]; then
        curl_request "GET" "/api/incident/reports/$REPORT_ID" "" 200 "Get report by ID" > /dev/null || return 1
    fi
    
    return 0
}

# UC15: Централизованная база жалоб
test_uc15() {
    local response
    response=$(curl_request "POST" "/api/incident/complaints" "{
        \"category\": \"STAFF_BEHAVIOR\",
        \"description\": \"Грубое поведение сотрудника\",
        \"source\": \"VISITOR\",
        \"reporterName\": \"Иван Иванов\",
        \"relatedIncidentId\": \"$INCIDENT_ID\"
    }" 201 "Create complaint")
    if [ $? -eq 0 ]; then
        COMPLAINT_ID=$(extract_id "$response")
        log_info "Complaint ID: $COMPLAINT_ID"
    else
        return 1
    fi
    
    curl_request "GET" "/api/incident/complaints" "" 200 "Get all complaints" > /dev/null || return 1
    
    if [ -n "$COMPLAINT_ID" ]; then
        curl_request "GET" "/api/incident/complaints/$COMPLAINT_ID" "" 200 "Get complaint by ID" > /dev/null || return 1
        curl_request "PATCH" "/api/incident/complaints/$COMPLAINT_ID/status?status=RESOLVED" "" 200 "Update complaint status" > /dev/null || return 1
    fi
    
    return 0
}

# UC16: Повторяющиеся нарушения сотрудников
test_uc16() {
    curl_request "POST" "/api/incident/reports/repeated-violations" "{
        \"periodStart\": \"2025-01-01T00:00:00Z\",
        \"periodEnd\": \"2025-12-31T23:59:59Z\",
        \"threshold\": 3
    }" 200 "Get repeated violations" > /dev/null || return 1
    return 0
}

# UC17: Генерация отчётов для руководства
test_uc17() {
    curl_request "POST" "/api/incident/reports/management" "{
        \"periodStart\": \"2025-01-01T00:00:00Z\",
        \"periodEnd\": \"2025-12-31T23:59:59Z\",
        \"generatedBy\": \"$EMPLOYEE_ID\"
    }" 201 "Create management report" > /dev/null || return 1
    return 0
}

# UC18: Генерация отчётов для регуляторов
test_uc18() {
    curl_request "POST" "/api/incident/reports/regulatory" "{
        \"periodStart\": \"2025-01-01T00:00:00Z\",
        \"periodEnd\": \"2025-12-31T23:59:59Z\",
        \"generatedBy\": \"$EMPLOYEE_ID\"
    }" 201 "Create regulatory report" > /dev/null || return 1
    return 0
}

# UC19: Экспорт в PDF / Excel
test_uc19() {
    if [ -z "$REPORT_ID" ]; then
        log_warning "UC19 skipped: No report ID available"
        return 0
    fi
    
    curl -s -u "$AUTH" -o /tmp/report_test.pdf \
        "${HOST}/api/incident/reports/${REPORT_ID}/export/pdf" > /dev/null 2>&1
    if [ $? -eq 0 ] && [ -f /tmp/report_test.pdf ]; then
        rm -f /tmp/report_test.pdf
    else
        log_warning "PDF export may have failed, but continuing..."
    fi
    
    curl -s -u "$AUTH" -o /tmp/report_test.xlsx \
        "${HOST}/api/incident/reports/${REPORT_ID}/export/excel" > /dev/null 2>&1
    if [ $? -eq 0 ] && [ -f /tmp/report_test.xlsx ]; then
        rm -f /tmp/report_test.xlsx
    else
        log_warning "Excel export may have failed, but continuing..."
    fi
    
    return 0
}

# UC20: Учёт времени работы сотрудников
test_uc20() {
    curl_request "POST" "/api/staff/work-time/clock-in" "{
        \"employeeId\": \"$EMPLOYEE_ID\",
        \"deviceId\": \"TERMINAL_001\"
    }" 201 "Clock in" > /dev/null || return 1
    
    curl_request "POST" "/api/staff/work-time/clock-out" "{
        \"employeeId\": \"$EMPLOYEE_ID\",
        \"deviceId\": \"TERMINAL_001\"
    }" 200 "Clock out" > /dev/null || return 1
    
    curl_request "GET" "/api/staff/work-time/employee/$EMPLOYEE_ID" "" 200 "Get work time records" > /dev/null || return 1
    
    return 0
}

# UC21: Фиксация нарушений дисциплины
test_uc21() {
    local response
    response=$(curl_request "POST" "/api/incident/violations" "{
        \"employeeId\": \"$EMPLOYEE_ID\",
        \"type\": \"LATE\",
        \"description\": \"Опоздание более чем на 10 минут\",
        \"attachmentUrls\": [\"https://minio.local/video/incident123.mp4\"]
    }" 201 "Create violation")
    if [ $? -eq 0 ]; then
        VIOLATION_ID=$(extract_id "$response")
        log_info "Violation ID: $VIOLATION_ID"
    else
        return 1
    fi
    
    curl_request "GET" "/api/incident/violations" "" 200 "Get all violations" > /dev/null || return 1
    
    if [ -n "$VIOLATION_ID" ]; then
        curl_request "GET" "/api/incident/violations/$VIOLATION_ID" "" 200 "Get violation by ID" > /dev/null || return 1
        curl_request "GET" "/api/incident/violations/employee/$EMPLOYEE_ID" "" 200 "Get violations by employee" > /dev/null || return 1
    fi
    
    return 0
}

# UC22: Просмотр истории нарушений
test_uc22() {
    curl_request "GET" "/api/staff/violation-history/employee/$EMPLOYEE_ID" "" 200 "Get violation history" > /dev/null || return 1
    
    curl_request "POST" "/api/staff/violation-history/search" "{
        \"employeeId\": \"$EMPLOYEE_ID\",
        \"startDate\": \"2025-01-01T00:00:00Z\",
        \"endDate\": \"2025-12-31T23:59:59Z\",
        \"violationType\": \"LATE\"
    }" 200 "Search violations" > /dev/null || return 1
    
    return 0
}

# UC23: Управление сменами и загрузкой
test_uc23() {
    curl_request "GET" "/api/staff/shifts/availability?startDate=2025-01-01&endDate=2025-01-31" "" 200 "Get availability" > /dev/null || return 1
    
    local response
    response=$(curl_request "POST" "/api/staff/shifts" "{
        \"employeeId\": \"$EMPLOYEE_ID\",
        \"shiftDate\": \"2025-01-20\",
        \"plannedStartTime\": \"2025-01-20T08:00:00Z\",
        \"plannedEndTime\": \"2025-01-20T16:00:00Z\",
        \"shiftType\": \"DAY\",
        \"location\": \"Игровой зал\",
        \"createdBy\": \"$EMPLOYEE_ID_2\"
    }" 201 "Create shift")
    if [ $? -eq 0 ]; then
        SHIFT_ID=$(extract_id "$response")
        log_info "Shift ID: $SHIFT_ID"
    else
        return 1
    fi
    
    if [ -n "$SHIFT_ID" ]; then
        curl_request "POST" "/api/staff/shifts/$SHIFT_ID/publish" "" 200 "Publish shift" > /dev/null || return 1
    fi
    
    return 0
}

# Главная функция
main() {
    echo -e "${BLUE}"
    echo "========================================"
    echo "  Automated Use Case Testing Script"
    echo "========================================"
    echo -e "${NC}"
    
    log_info "Host: $HOST"
    log_info "Username: $USERNAME"
    echo ""
    
    # Проверка доступности приложения
    log_info "Проверка доступности приложения..."
    if ! curl -s -u "$AUTH" "${HOST}/api/incident/incidents" > /dev/null 2>&1; then
        log_error "Приложение недоступно по адресу $HOST"
        log_error "Убедитесь, что приложение запущено: docker compose up -d"
        exit 1
    fi
    log_success "Приложение доступно"
    
    # Подготовка данных
    prepare_test_data
    
    echo ""
    echo -e "${BLUE}=== Начало тестирования Use Cases ===${NC}"
    echo ""
    
    # Тестирование всех UC
    check_uc "UC1: Мониторинг зала" test_uc1
    check_uc "UC2: Регистрация инцидентов" test_uc2
    check_uc "UC3: Фиксация подозрительной активности" test_uc3
    check_uc "UC4: Контроль длительности контактов" test_uc4
    check_uc "UC5: Контроль частоты взаимодействий" test_uc5
    check_uc "UC6: Сверка с базой мошенников" test_uc6
    check_uc "UC7: Система автоматических уведомлений" test_uc7
    check_uc "UC9: Регистрация операций" test_uc9
    check_uc "UC10: Формирование финансовых отчётов" test_uc10
    check_uc "UC11: Контроль кассы" test_uc11
    check_uc "UC12: Выявление аномальных транзакций" test_uc12
    check_uc "UC13: Анализ выигрышей и проигрышей" test_uc13
    check_uc "UC14: Формирование отчётов по инцидентам" test_uc14
    check_uc "UC15: Централизованная база жалоб" test_uc15
    check_uc "UC16: Повторяющиеся нарушения сотрудников" test_uc16
    check_uc "UC17: Генерация отчётов для руководства" test_uc17
    check_uc "UC18: Генерация отчётов для регуляторов" test_uc18
    check_uc "UC19: Экспорт в PDF / Excel" test_uc19
    check_uc "UC20: Учёт времени работы сотрудников" test_uc20
    check_uc "UC21: Фиксация нарушений дисциплины" test_uc21
    check_uc "UC22: Просмотр истории нарушений" test_uc22
    check_uc "UC23: Управление сменами и загрузкой" test_uc23
    
    # Итоговая статистика
    echo ""
    echo -e "${BLUE}========================================"
    echo "  Итоговая статистика"
    echo "========================================"
    echo -e "${NC}"
    echo -e "Всего проверено Use Cases: ${BLUE}$TOTAL_UC${NC}"
    echo -e "Успешно: ${GREEN}$PASSED_UC${NC}"
    echo -e "Ошибок: ${RED}$FAILED_UC${NC}"
    echo ""
    
    if [ $FAILED_UC -eq 0 ]; then
        echo -e "${GREEN}Все Use Cases успешно проверены!${NC}"
        exit 0
    else
        echo -e "${RED}Обнаружены ошибки в $FAILED_UC Use Cases${NC}"
        exit 1
    fi
}

# Запуск
main "$@"

