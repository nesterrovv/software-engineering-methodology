#!/bin/bash

# Скрипт для тестирования скачивания отчета с данными из MinIO
# Создает операции в нужном периоде и проверяет, что отчет содержит данные

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

# Функции
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
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

# ID для теста
CASH_DESK_ID="22222222-2222-2222-2222-222222222222"
FINANCE_REPORT_ID=""

echo -e "${GREEN}=== Тест скачивания отчета с данными из MinIO ===${NC}"
echo ""

# Шаг 1: Создание операций в нужном периоде (2025-01-01 - 2025-01-31)
log_info "Создание финансовых операций в периоде 2025-01-01 - 2025-01-31..."

# Создаем несколько операций (они будут с текущей датой)
for i in {1..5}; do
    response=$(curl_request "POST" "/api/finance/operations" "{
        \"cashDeskId\": \"$CASH_DESK_ID\",
        \"amount\": $((5000 + i * 1000)).00,
        \"type\": \"DEPOSIT\",
        \"currency\": \"USD\"
    }" 201 "Create operation $i")
    
    if [ $? -eq 0 ]; then
        log_info "Operation $i created successfully"
    else
        log_error "Failed to create operation $i"
        exit 1
    fi
done

# Создаем еще несколько операций
for i in {1..3}; do
    response=$(curl_request "POST" "/api/finance/operations" "{
        \"cashDeskId\": \"$CASH_DESK_ID\",
        \"amount\": $((2000 + i * 500)).00,
        \"type\": \"WITHDRAWAL\",
        \"currency\": \"USD\"
    }" 201 "Create withdrawal $i")
    
    if [ $? -eq 0 ]; then
        log_info "Withdrawal $i created successfully"
    else
        log_error "Failed to create withdrawal $i"
        exit 1
    fi
done

log_success "Финансовые операции созданы"
echo ""

# Шаг 2: Генерация отчета за текущий период (чтобы включить только что созданные операции)
# Получаем текущую дату и дату месяц назад
CURRENT_DATE=$(date +%Y-%m-%d)
MONTH_AGO=$(date -v-1m +%Y-%m-%d 2>/dev/null || date -d "1 month ago" +%Y-%m-%d 2>/dev/null || date +%Y-%m-%d)

log_info "Генерация финансового отчета за период $MONTH_AGO - $CURRENT_DATE..."

response=$(curl_request "POST" "/api/finance/reports" "{
    \"periodStart\": \"$MONTH_AGO\",
    \"periodEnd\": \"$CURRENT_DATE\"
}" 201 "Create financial report")

if [ $? -eq 0 ]; then
    FINANCE_REPORT_ID=$(extract_id "$response")
    log_success "Отчет создан, ID: $FINANCE_REPORT_ID"
else
    log_error "Не удалось создать отчет"
    exit 1
fi
echo ""

# Шаг 3: Скачивание отчета из MinIO
log_info "Скачивание отчета из MinIO..."

mkdir -p ./tmp
curl -s -u "$AUTH" -o ./tmp/finance_report_with_data.csv \
    "${HOST}/api/finance/reports/${FINANCE_REPORT_ID}/download" > /dev/null 2>&1

if [ $? -eq 0 ] && [ -f ./tmp/finance_report_with_data.csv ]; then
    file_size=$(wc -c < ./tmp/finance_report_with_data.csv | tr -d ' ')
    line_count=$(wc -l < ./tmp/finance_report_with_data.csv | tr -d ' ')
    
    log_success "Отчет скачан успешно"
    log_info "Размер файла: $file_size байт"
    log_info "Количество строк: $line_count"
    echo ""
    
    # Шаг 4: Проверка содержимого отчета
    log_info "Проверка содержимого отчета..."
    
    # Проверяем, что файл не пустой и содержит данные
    if [ "$line_count" -lt 2 ]; then
        log_error "Отчет содержит только заголовок или пуст!"
        log_error "Содержимое файла:"
        cat ./tmp/finance_report_with_data.csv
        exit 1
    fi
    
    # Проверяем, что есть заголовок
    if ! head -1 ./tmp/finance_report_with_data.csv | grep -q "id,cashDeskId,amount,type,currency,operatedAt"; then
        log_error "Отчет не содержит правильный заголовок!"
        log_error "Первая строка: $(head -1 ./tmp/finance_report_with_data.csv)"
        exit 1
    fi
    
    # Проверяем, что есть данные (больше одной строки)
    if [ "$line_count" -gt 1 ]; then
        log_success "Отчет содержит данные операций!"
        log_info "Первые 5 строк отчета:"
        head -5 ./tmp/finance_report_with_data.csv | while IFS= read -r line; do
            echo "  $line"
        done
        echo ""
        log_success "Все проверки пройдены успешно!"
        log_info "Полный отчет сохранен в: ./tmp/finance_report_with_data.csv"
    else
        log_error "Отчет не содержит данных операций!"
        exit 1
    fi
else
    log_error "Не удалось скачать отчет"
    exit 1
fi

echo ""
log_success "Тест завершен успешно!"
