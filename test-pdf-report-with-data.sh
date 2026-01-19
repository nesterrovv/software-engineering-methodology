#!/bin/bash

set -e

HOST="http://localhost:8080"
AUTH="admin:admin"
EMPLOYEE_ID="11111111-1111-1111-1111-111111111111"

echo "════════════════════════════════════════════════════════════"
echo "🎯 Тест PDF экспорта с реальными данными"
echo "════════════════════════════════════════════════════════════"

# Шаг 1: Создаем тестовые инциденты разных типов
echo ""
echo "📝 Шаг 1: Создание тестовых инцидентов..."

# Инцидент 1: THEFT (Кража)
echo "  → Создаем инцидент THEFT..."
INCIDENT_1=$(curl -s -u "$AUTH" -X POST "${HOST}/api/incident/incidents" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "THEFT",
    "description": "Обнаружена кража жетонов из кассы №3",
    "location": "Касса №3",
    "reportedBy": "'"$EMPLOYEE_ID"'",
    "participants": ["Охранник Петров И.И."]
  }' | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 'ERROR'))")
echo "     ✓ Инцидент THEFT создан: $INCIDENT_1"

# Инцидент 2: FIGHT (Драка)
echo "  → Создаем инцидент FIGHT..."
INCIDENT_2=$(curl -s -u "$AUTH" -X POST "${HOST}/api/incident/incidents" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "FIGHT",
    "description": "Драка между посетителями в VIP-зале",
    "location": "VIP-зал",
    "reportedBy": "'"$EMPLOYEE_ID"'",
    "participants": ["Посетитель А", "Посетитель Б", "Охранник Иванов С.П."]
  }' | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 'ERROR'))")
echo "     ✓ Инцидент FIGHT создан: $INCIDENT_2"

# Инцидент 3: DRUNKENNESS (Пьяный дебош)
echo "  → Создаем инцидент DRUNKENNESS..."
INCIDENT_3=$(curl -s -u "$AUTH" -X POST "${HOST}/api/incident/incidents" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "DRUNKENNESS",
    "description": "Пьяный посетитель нарушает порядок в игровом зале",
    "location": "Игровой зал",
    "reportedBy": "'"$EMPLOYEE_ID"'",
    "participants": ["Охранник Морозов Д.Н."]
  }' | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 'ERROR'))")
echo "     ✓ Инцидент DRUNKENNESS создан: $INCIDENT_3"

# Инцидент 4: CHEATING (Мошенничество)
echo "  → Создаем инцидент CHEATING..."
INCIDENT_4=$(curl -s -u "$AUTH" -X POST "${HOST}/api/incident/incidents" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CHEATING",
    "description": "Подозрение на мошенничество за столом №15",
    "location": "Игровой стол №15",
    "reportedBy": "'"$EMPLOYEE_ID"'",
    "participants": ["Крупье Сидорова А.В.", "Подозреваемый игрок"]
  }' | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 'ERROR'))")
echo "     ✓ Инцидент CHEATING создан: $INCIDENT_4"

# Инцидент 5: OTHER (Прочее)
echo "  → Создаем инцидент OTHER..."
INCIDENT_5=$(curl -s -u "$AUTH" -X POST "${HOST}/api/incident/incidents" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "OTHER",
    "description": "Отключение электричества на 5 минут",
    "location": "Все помещение",
    "reportedBy": "'"$EMPLOYEE_ID"'",
    "participants": ["Технический персонал"]
  }' | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 'ERROR'))")
echo "     ✓ Инцидент OTHER создан: $INCIDENT_5"

echo ""
echo "✅ Создано 5 инцидентов разных типов"

# Шаг 2: Создаем несколько жалоб
echo ""
echo "📝 Шаг 2: Создание тестовых жалоб..."

# Жалоба 1
echo "  → Создаем жалобу на качество обслуживания..."
COMPLAINT_1=$(curl -s -u "$AUTH" -X POST "${HOST}/api/incident/complaints" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "SERVICE_QUALITY",
    "description": "Долгое ожидание обслуживания в баре",
    "reporterName": "Анонимный посетитель",
    "source": "VISITOR"
  }' | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 'ERROR'))")
echo "     ✓ Жалоба SERVICE_QUALITY создана: $COMPLAINT_1"

# Жалоба 2
echo "  → Создаем жалобу на поведение персонала..."
COMPLAINT_2=$(curl -s -u "$AUTH" -X POST "${HOST}/api/incident/complaints" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "STAFF_BEHAVIOR",
    "description": "Грубое обращение со стороны охранника",
    "reporterName": "Смирнов В.П.",
    "source": "VISITOR"
  }' | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 'ERROR'))")
echo "     ✓ Жалоба STAFF_BEHAVIOR создана: $COMPLAINT_2"

# Жалоба 3
echo "  → Создаем жалобу на игровые проблемы..."
COMPLAINT_3=$(curl -s -u "$AUTH" -X POST "${HOST}/api/incident/complaints" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "GAME_ISSUES",
    "description": "Неисправность игрового автомата №42",
    "reporterName": "Посетитель Козлов А.А.",
    "source": "VISITOR"
  }' | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 'ERROR'))")
echo "     ✓ Жалоба GAME_ISSUES создана: $COMPLAINT_3"

echo ""
echo "✅ Создано 3 жалобы"

# Шаг 3: Получаем текущую дату для отчета
CURRENT_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
START_DATE=$(date -u -v-1d +"%Y-%m-%dT00:00:00Z")
END_DATE=$(date -u +"%Y-%m-%dT23:59:59Z")

echo ""
echo "📊 Шаг 3: Генерация отчета за период:"
echo "   От: $START_DATE"
echo "   До: $END_DATE"

# Генерируем отчет
REPORT_ID=$(curl -s -u "$AUTH" -X POST "${HOST}/api/incident/reports/incidents" \
  -H "Content-Type: application/json" \
  -d '{
    "periodStart": "'"$START_DATE"'",
    "periodEnd": "'"$END_DATE"'",
    "incidentTypes": ["THEFT", "FIGHT", "DRUNKENNESS", "CHEATING", "OTHER"],
    "generatedBy": "'"$EMPLOYEE_ID"'"
  }' | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 'ERROR'))")

echo ""
echo "✅ Отчет создан с ID: $REPORT_ID"

# Шаг 4: Проверяем содержимое отчета
echo ""
echo "📋 Шаг 4: Просмотр содержимого отчета..."
curl -s -u "$AUTH" "${HOST}/api/incident/reports/${REPORT_ID}" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'reportData' in data:
        report_data = json.loads(data['reportData'])
        print(f\"   Тип: {data.get('type', 'N/A')}\")
        print(f\"   Период: {data.get('periodStart', 'N/A')} - {data.get('periodEnd', 'N/A')}\")
        print(f\"   Всего инцидентов: {report_data.get('totalIncidents', 0)}\")
        print(f\"   Инциденты по типам: {report_data.get('incidentsByType', {})}\")
        print(f\"   Жалобы по категориям: {report_data.get('complaintsByCategory', {})}\")
    else:
        print(f\"   Ошибка: {data}\")
except Exception as e:
    print(f\"   Ошибка обработки: {e}\")
"

# Шаг 5: Экспорт в PDF (оба варианта URL)
echo ""
echo "📥 Шаг 5: Экспорт отчета в PDF..."

echo "  → Скачивание через основной URL..."
curl -s -u "$AUTH" "${HOST}/api/incident/reports/${REPORT_ID}/export/pdf" \
  -o "incident_report_${REPORT_ID}.pdf"
if [ -f "incident_report_${REPORT_ID}.pdf" ]; then
    SIZE=$(ls -lh "incident_report_${REPORT_ID}.pdf" | awk '{print $5}')
    echo "     ✓ PDF сохранен: incident_report_${REPORT_ID}.pdf (${SIZE})"
fi

echo "  → Скачивание через альтернативный URL..."
curl -s -u "$AUTH" "${HOST}/api/incidents/report/${REPORT_ID}/export/pdf" \
  -o "incident_report_alt_${REPORT_ID}.pdf"
if [ -f "incident_report_alt_${REPORT_ID}.pdf" ]; then
    SIZE=$(ls -lh "incident_report_alt_${REPORT_ID}.pdf" | awk '{print $5}')
    echo "     ✓ PDF сохранен: incident_report_alt_${REPORT_ID}.pdf (${SIZE})"
fi

# Шаг 6: Экспорт в Excel
echo ""
echo "📥 Шаг 6: Экспорт отчета в Excel..."
curl -s -u "$AUTH" "${HOST}/api/incident/reports/${REPORT_ID}/export/excel" \
  -o "incident_report_${REPORT_ID}.xlsx"
if [ -f "incident_report_${REPORT_ID}.xlsx" ]; then
    SIZE=$(ls -lh "incident_report_${REPORT_ID}.xlsx" | awk '{print $5}')
    echo "     ✓ Excel сохранен: incident_report_${REPORT_ID}.xlsx (${SIZE})"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ ТЕСТ ЗАВЕРШЕН УСПЕШНО!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📁 Созданные файлы:"
ls -lh incident_report_*.pdf incident_report_*.xlsx 2>/dev/null | awk '{print "   " $9 " (" $5 ")"}'
echo ""
echo "🔗 Полезные ссылки:"
echo "   Swagger UI: ${HOST}/swagger-ui.html"
echo "   Отчет в API: ${HOST}/api/incident/reports/${REPORT_ID}"
echo ""
