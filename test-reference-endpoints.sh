#!/bin/bash

# Тестовый скрипт для проверки справочных эндпоинтов
# Проверяет доступность эндпоинтов для получения списков:
# - Касс (Cash Desks)
# - Игровых столов (Game Tables)
# - Смен (Shifts)

set -e

HOST="${HOST:-http://localhost:8080}"
USERNAME="${USERNAME:-admin}"
PASSWORD="${PASSWORD:-admin}"

echo "==================================="
echo "ПРОВЕРКА СПРАВОЧНЫХ ЭНДПОИНТОВ"
echo "==================================="
echo "Host: $HOST"
echo ""

# Функция для выполнения запросов
curl_request() {
    local method=$1
    local path=$2
    local data=$3
    
    if [ -z "$data" ]; then
        curl -s -X "$method" \
            -u "$USERNAME:$PASSWORD" \
            -H "Content-Type: application/json" \
            "$HOST$path"
    else
        curl -s -X "$method" \
            -u "$USERNAME:$PASSWORD" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$HOST$path"
    fi
}

echo "1. Проверка эндпоинта GET /api/reference/cashdesks"
echo "   Получение списка касс..."
CASHDESKS_RESPONSE=$(curl_request GET "/api/reference/cashdesks")
CASHDESKS_COUNT=$(echo "$CASHDESKS_RESPONSE" | jq '. | length')
echo "   ✓ Получено касс: $CASHDESKS_COUNT"

if [ "$CASHDESKS_COUNT" -gt 0 ]; then
    echo "   Первая касса:"
    echo "$CASHDESKS_RESPONSE" | jq '.[0]'
    
    # Извлекаем ID первой кассы для использования в других тестах
    FIRST_CASHDESK_ID=$(echo "$CASHDESKS_RESPONSE" | jq -r '.[0].id')
    echo "   ID первой кассы: $FIRST_CASHDESK_ID"
else
    echo "   ✗ ОШИБКА: Не получено ни одной кассы"
    exit 1
fi

echo ""
echo "2. Проверка эндпоинта GET /api/reference/gametables"
echo "   Получение списка игровых столов..."
GAMETABLES_RESPONSE=$(curl_request GET "/api/reference/gametables")
GAMETABLES_COUNT=$(echo "$GAMETABLES_RESPONSE" | jq '. | length')
echo "   ✓ Получено столов/автоматов: $GAMETABLES_COUNT"

if [ "$GAMETABLES_COUNT" -gt 0 ]; then
    echo "   Первый стол:"
    echo "$GAMETABLES_RESPONSE" | jq '.[0]'
    
    # Извлекаем ID первого стола для использования в других тестах
    FIRST_GAMETABLE_ID=$(echo "$GAMETABLES_RESPONSE" | jq -r '.[0].id')
    echo "   ID первого стола: $FIRST_GAMETABLE_ID"
else
    echo "   ✗ ОШИБКА: Не получено ни одного игрового стола"
    exit 1
fi

echo ""
echo "3. Проверка эндпоинта GET /api/staff/shifts"
echo "   Получение списка смен за период..."
START_DATE="2025-01-01"
END_DATE="2025-01-31"
SHIFTS_RESPONSE=$(curl_request GET "/api/staff/shifts?startDate=$START_DATE&endDate=$END_DATE")
SHIFTS_COUNT=$(echo "$SHIFTS_RESPONSE" | jq '. | length')
echo "   ✓ Получено смен за период $START_DATE - $END_DATE: $SHIFTS_COUNT"

if [ "$SHIFTS_COUNT" -gt 0 ]; then
    echo "   Первая смена:"
    echo "$SHIFTS_RESPONSE" | jq '.[0]'
    
    # Извлекаем ID первой смены
    FIRST_SHIFT_ID=$(echo "$SHIFTS_RESPONSE" | jq -r '.[0].id')
    echo "   ID первой смены: $FIRST_SHIFT_ID"
fi

echo ""
echo "==================================="
echo "ПРОВЕРКА ИСПОЛЬЗОВАНИЯ UUID"
echo "==================================="
echo ""

echo "4. Проверка создания операции с полученным ID кассы"
echo "   Создаем операцию для кассы $FIRST_CASHDESK_ID..."
OPERATION_DATA=$(cat <<EOF
{
  "cashDeskId": "$FIRST_CASHDESK_ID",
  "amount": 1000.00,
  "type": "DEPOSIT",
  "currency": "RUB",
  "operatedAt": "2025-01-15T10:00:00"
}
EOF
)

OPERATION_RESPONSE=$(curl_request POST "/api/finance/operations" "$OPERATION_DATA")
OPERATION_ID=$(echo "$OPERATION_RESPONSE" | jq -r '.id')

if [ -n "$OPERATION_ID" ] && [ "$OPERATION_ID" != "null" ]; then
    echo "   ✓ Операция создана с ID: $OPERATION_ID"
    echo "   Данные операции:"
    echo "$OPERATION_RESPONSE" | jq '.'
else
    echo "   ✗ ОШИБКА: Не удалось создать операцию"
    echo "   Ответ: $OPERATION_RESPONSE"
    exit 1
fi

echo ""
echo "5. Проверка получения операции по ID"
OPERATION_GET=$(curl_request GET "/api/finance/operations/$OPERATION_ID")
OPERATION_CASHDESK=$(echo "$OPERATION_GET" | jq -r '.cashDeskId')
echo "   ✓ Операция получена, cashDeskId: $OPERATION_CASHDESK"

if [ "$OPERATION_CASHDESK" == "$FIRST_CASHDESK_ID" ]; then
    echo "   ✓ cashDeskId совпадает с использованным при создании"
else
    echo "   ✗ ОШИБКА: cashDeskId не совпадает"
    exit 1
fi

echo ""
echo "==================================="
echo "ИТОГОВАЯ ПРОВЕРКА"
echo "==================================="
echo ""
echo "✓ Эндпоинт касс работает, возвращает $CASHDESKS_COUNT касс"
echo "✓ Эндпоинт столов работает, возвращает $GAMETABLES_COUNT столов"
echo "✓ Эндпоинт смен работает, возвращает $SHIFTS_COUNT смен"
echo "✓ UUID из справочников можно использовать в запросах"
echo ""
echo "ПРИМЕРЫ UUID ДЛЯ ФРОНТЕНДА:"
echo "  - Касса (cashDeskId): $FIRST_CASHDESK_ID"
echo "  - Стол (gameTableId): $FIRST_GAMETABLE_ID"
if [ -n "$FIRST_SHIFT_ID" ] && [ "$FIRST_SHIFT_ID" != "null" ]; then
    echo "  - Смена (shiftId): $FIRST_SHIFT_ID"
fi
echo ""
echo "==================================="
echo "ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ УСПЕШНО ✓"
echo "==================================="
