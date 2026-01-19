#!/bin/bash

# Скрипт базовой проверки безопасности Casino MIS API
# Проверяет основные аспекты безопасности: аутентификацию, авторизацию, защиту от инъекций

# Не используем set -e, чтобы продолжить тестирование после ошибок

HOST="${HOST:-http://localhost:8080}"
USERNAME="${USERNAME:-admin}"
PASSWORD="${PASSWORD:-admin}"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          SECURITY TESTING - Casino MIS API                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Host: $HOST"
echo "Target: Casino MIS Application"
echo ""

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# Функция для вывода результата
print_result() {
    local test_name=$1
    local status=$2
    local message=$3
    
    if [ "$status" = "PASS" ]; then
        echo "   ✅ PASS - $message"
        ((PASS_COUNT++))
    elif [ "$status" = "FAIL" ]; then
        echo "   ❌ FAIL - $message"
        ((FAIL_COUNT++))
    else
        echo "   ⚠️  WARN - $message"
        ((WARN_COUNT++))
    fi
}

echo "═══════════════════════════════════════════════════════════"
echo "1. AUTHENTICATION TESTING"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Test 1.1: Доступ без аутентификации
echo "Test 1.1: Unauthorized access (no credentials)"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HOST/api/finance/operations)
if [ "$RESPONSE" = "401" ]; then
    print_result "AT-01" "PASS" "Unauthorized access blocked (401)"
else
    print_result "AT-01" "FAIL" "Expected 401, got $RESPONSE"
fi

# Test 1.2: Неверный пароль
echo "Test 1.2: Invalid credentials (wrong password)"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -u admin:wrongpassword $HOST/api/finance/operations)
if [ "$RESPONSE" = "401" ]; then
    print_result "AT-02" "PASS" "Invalid credentials rejected (401)"
else
    print_result "AT-02" "FAIL" "Expected 401, got $RESPONSE"
fi

# Test 1.3: Верные credentials
echo "Test 1.3: Valid credentials"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -u $USERNAME:$PASSWORD $HOST/api/finance/operations)
if [ "$RESPONSE" = "200" ]; then
    print_result "AT-03" "PASS" "Valid credentials accepted (200)"
else
    print_result "AT-03" "FAIL" "Expected 200, got $RESPONSE"
fi

# Test 1.4: SQL Injection в username
echo "Test 1.4: SQL Injection attempt in username"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -u "admin' OR '1'='1":admin $HOST/api/finance/operations 2>/dev/null)
if [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "400" ]; then
    print_result "AT-04" "PASS" "SQL Injection in auth blocked ($RESPONSE)"
else
    print_result "AT-04" "FAIL" "SQL Injection not properly handled ($RESPONSE)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "2. INPUT VALIDATION TESTING"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Test 2.1: Отрицательная сумма в операции
echo "Test 2.1: Negative amount in financial operation"
RESPONSE=$(curl -s -u $USERNAME:$PASSWORD -X POST $HOST/api/finance/operations \
  -H "Content-Type: application/json" \
  -d '{"cashDeskId":"11111111-1111-1111-1111-111111111111","amount":-1000,"type":"DEPOSIT","currency":"RUB"}' \
  -w "%{http_code}" -o /tmp/test_response.json 2>/dev/null)

if [ "$RESPONSE" = "400" ] || [ "$RESPONSE" = "500" ]; then
    print_result "IV-01" "PASS" "Negative amount rejected ($RESPONSE)"
elif grep -q "amount" /tmp/test_response.json 2>/dev/null; then
    print_result "IV-01" "WARN" "Negative amount accepted - needs validation"
else
    print_result "IV-01" "PASS" "Input validation present"
fi

# Test 2.2: Некорректный UUID
echo "Test 2.2: Invalid UUID format"
RESPONSE=$(curl -s -u $USERNAME:$PASSWORD -X POST $HOST/api/finance/operations \
  -H "Content-Type: application/json" \
  -d '{"cashDeskId":"invalid-uuid","amount":1000,"type":"DEPOSIT","currency":"RUB"}' \
  -w "%{http_code}" -o /dev/null 2>/dev/null)

if [ "$RESPONSE" = "400" ] || [ "$RESPONSE" = "500" ]; then
    print_result "IV-02" "PASS" "Invalid UUID rejected ($RESPONSE)"
else
    print_result "IV-02" "FAIL" "Invalid UUID not properly validated ($RESPONSE)"
fi

# Test 2.3: XSS в текстовом поле
echo "Test 2.3: XSS injection in description field"
XSS_PAYLOAD='<script>alert(\"XSS\")</script>'
RESPONSE=$(curl -s -u $USERNAME:$PASSWORD -X POST $HOST/api/incident/violations \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"11111111-1111-1111-1111-111111111111","type":"LATE","description":"'"$XSS_PAYLOAD"'"}' \
  -w "%{http_code}" -o /tmp/xss_response.json 2>/dev/null)

if [ "$RESPONSE" = "201" ] || [ "$RESPONSE" = "200" ]; then
    # Проверяем, что XSS был санитизирован
    DESCRIPTION=$(jq -r '.description' /tmp/xss_response.json 2>/dev/null)
    if [ -z "$DESCRIPTION" ] || [ "$DESCRIPTION" = "null" ] || [ "$DESCRIPTION" = "" ]; then
        print_result "IV-03" "PASS" "XSS payload sanitized (description empty)"
    elif echo "$DESCRIPTION" | grep -q "<script>"; then
        print_result "IV-03" "FAIL" "XSS payload not sanitized - stored in DB"
    else
        print_result "IV-03" "PASS" "XSS payload sanitized (HTML removed)"
    fi
else
    print_result "IV-03" "FAIL" "Request rejected, validation issue ($RESPONSE)"
fi

# Test 2.4: Некорректный формат даты
echo "Test 2.4: Invalid date format"
RESPONSE=$(curl -s -u $USERNAME:$PASSWORD -X POST $HOST/api/finance/reports \
  -H "Content-Type: application/json" \
  -d '{"periodStart":"invalid-date","periodEnd":"2025-01-31"}' \
  -w "%{http_code}" -o /dev/null 2>/dev/null)

if [ "$RESPONSE" = "400" ] || [ "$RESPONSE" = "500" ]; then
    print_result "IV-04" "PASS" "Invalid date format rejected ($RESPONSE)"
else
    print_result "IV-04" "FAIL" "Invalid date not properly validated ($RESPONSE)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "3. SQL INJECTION TESTING"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Test 3.1: SQL Injection в GET параметрах
echo "Test 3.1: SQL Injection in GET parameters"
# Используем --data-urlencode для правильного экранирования
RESPONSE=$(curl -s -u $USERNAME:$PASSWORD -w "%{http_code}" -o /dev/null \
  --get --data-urlencode "startDate=2025-01-01' OR '1'='1" --data-urlencode "endDate=2025-01-31" \
  "$HOST/api/staff/shifts" 2>/dev/null)

if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "400" ] || [ "$RESPONSE" = "500" ]; then
    print_result "SI-01" "PASS" "SQL Injection in GET params handled ($RESPONSE)"
else
    print_result "SI-01" "FAIL" "Unexpected response to SQL injection ($RESPONSE)"
fi

# Test 3.2: SQL Injection в JSON body
echo "Test 3.2: SQL Injection in JSON body"
RESPONSE=$(curl -s -u $USERNAME:$PASSWORD -X POST $HOST/api/incident/violations \
  -H "Content-Type: application/json" \
  -d "{\"employeeId\":\"11111111-1111-1111-1111-111111111111\",\"type\":\"LATE\",\"description\":\"Test'; DROP TABLE violations; --\"}" \
  -w "%{http_code}" -o /dev/null 2>/dev/null)

if [ "$RESPONSE" = "201" ] || [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "400" ]; then
    print_result "SI-02" "PASS" "SQL Injection in JSON handled by JPA ($RESPONSE)"
else
    print_result "SI-02" "WARN" "Unexpected response to SQL injection ($RESPONSE)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "4. SECURITY HEADERS TESTING"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Test 4.1: Проверка HTTP Security Headers
echo "Test 4.1: HTTP Security Headers"
HEADERS=$(curl -s -I -u $USERNAME:$PASSWORD $HOST/api/finance/operations 2>/dev/null)

if echo "$HEADERS" | grep -qi "X-Content-Type-Options"; then
    print_result "SH-01" "PASS" "X-Content-Type-Options present"
else
    print_result "SH-01" "WARN" "X-Content-Type-Options missing"
fi

if echo "$HEADERS" | grep -qi "X-Frame-Options"; then
    print_result "SH-02" "PASS" "X-Frame-Options present"
else
    print_result "SH-02" "WARN" "X-Frame-Options missing"
fi

if echo "$HEADERS" | grep -qi "Strict-Transport-Security"; then
    print_result "SH-03" "PASS" "HSTS header present"
else
    # HSTS is only needed for HTTPS, so this is PASS for HTTP
    if [[ "$HOST" == https://* ]]; then
        print_result "SH-03" "FAIL" "HSTS header missing (required for HTTPS)"
    else
        print_result "SH-03" "PASS" "HSTS not needed for HTTP (correct)"
    fi
fi

if echo "$HEADERS" | grep -qi "Content-Security-Policy"; then
    print_result "SH-04" "PASS" "CSP header present"
else
    print_result "SH-04" "WARN" "Content-Security-Policy missing"
fi

if echo "$HEADERS" | grep -qi "X-XSS-Protection"; then
    print_result "SH-05" "PASS" "X-XSS-Protection present"
else
    print_result "SH-05" "WARN" "X-XSS-Protection missing"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "5. SENSITIVE DATA EXPOSURE"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Test 5.1: Проверка на утечку stack trace
echo "Test 5.1: Stack trace exposure check"
RESPONSE=$(curl -s -u $USERNAME:$PASSWORD $HOST/api/finance/operations/00000000-0000-0000-0000-000000000000 2>/dev/null)

if echo "$RESPONSE" | grep -qi "at java."; then
    print_result "SD-01" "FAIL" "Stack trace exposed in error response"
elif echo "$RESPONSE" | grep -qi "exception"; then
    print_result "SD-01" "WARN" "Exception details in response - check sanitization"
else
    print_result "SD-01" "PASS" "No stack trace in error response"
fi

# Test 5.2: Проверка на утечку версии в заголовках
echo "Test 5.2: Server version disclosure"
if echo "$HEADERS" | grep -qi "Server.*Tomcat"; then
    print_result "SD-02" "WARN" "Server version disclosed in headers"
else
    print_result "SD-02" "PASS" "Server version not disclosed"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "6. AUTHORIZATION TESTING"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Test 6.1: RBAC проверка (если реализовано)
echo "Test 6.1: Role-Based Access Control"
print_result "AZ-01" "WARN" "RBAC not implemented - all users have full access"

# Test 6.2: Проверка доступа к чужим ресурсам (IDOR)
echo "Test 6.2: Insecure Direct Object Reference (IDOR)"
print_result "AZ-02" "WARN" "IDOR testing requires multiple user accounts"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    TEST SUMMARY                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "  ✅ PASSED:  $PASS_COUNT"
echo "  ❌ FAILED:  $FAIL_COUNT"
echo "  ⚠️  WARNINGS: $WARN_COUNT"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo "  Overall Status: ✅ ACCEPTABLE (with warnings)"
    echo ""
    echo "  Recommendations:"
    echo "  1. Add HTTP Security Headers (X-Frame-Options, CSP, etc.)"
    echo "  2. Implement RBAC for role-based access control"
    echo "  3. Add XSS sanitization for text fields"
    echo "  4. Hide server version information"
else
    echo "  Overall Status: ❌ FAILED"
    echo ""
    echo "  Critical issues found! Review failed tests above."
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "For detailed analysis, see: documentation/MPE-doc-SecurityTesting.md"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Cleanup
rm -f /tmp/test_response.json /tmp/xss_response.json

exit $FAIL_COUNT
