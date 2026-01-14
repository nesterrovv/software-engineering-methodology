-- 1. Подготовка входных данных для тестируемой системы
-- Ожидаемый результат: данные успешно добавляются

INSERT INTO cash_operations (
    id,
    cash_desk_id,
    amount,
    type,
    currency,
    operated_at
) VALUES (
             '00000000-0000-0000-0000-000000000001',
             '10000000-0000-0000-0000-000000000001',
             500.00,
             'DEPOSIT',
             'USD',
             now()
         );

INSERT INTO anomalous_transactions (
    id,
    cash_operation_id,
    type,
    risk_level,
    amount,
    detected_at,
    status
) VALUES (
             '00000000-0000-0000-0000-000000000002',
             '00000000-0000-0000-0000-000000000001',
             'SUSPICIOUS',
             'MEDIUM',
             500.00,
             now(),
             'NEW'
         );
