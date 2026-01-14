-- 2.1 Проверка уникальности первичного ключа (id)
-- Ожидаемый результат: ошибка добавления — нарушение уникальности

INSERT INTO cash_operations (
    id,
    cash_desk_id,
    amount,
    type,
    currency,
    operated_at
) VALUES (
             '00000000-0000-0000-0000-000000000001',
             '20000000-0000-0000-0000-000000000002',
             100.00,
             'WITHDRAW',
             'USD',
             now()
         );

-- 2.2 Проверка ссылки на несуществующую запись
-- Ожидаемый результат: ошибка добавления — несуществующий ключ

INSERT INTO anomalous_transactions (
    id,
    cash_operation_id,
    type,
    risk_level,
    amount,
    detected_at,
    status
) VALUES (
             '00000000-0000-0000-0000-000000000003',
             '99999999-9999-9999-9999-999999999999',
             'SUSPICIOUS',
             'HIGH',
             1000.00,
             now(),
             'NEW'
         );

-- 2.3 Проверка ограничения CHECK и бизнес-правил
-- Ожидаемый результат: ошибка добавления

INSERT INTO cash_register_reconciliations (
    id,
    cash_desk_id,
    shift_start,
    shift_end,
    expected_balance,
    actual_balance,
    discrepancy,
    status,
    created_at
) VALUES (
             '00000000-0000-0000-0000-000000000004',
             '30000000-0000-0000-0000-000000000003',
             now(),
             now() - interval '2 hour',
             1000.00,
             900.00,
             -100.00,
             'CLOSED',
             now()
         );
