-- 3. Проверка связей между таблицами

-- Добавление связанной записи
INSERT INTO cash_operations (
    id,
    cash_desk_id,
    amount,
    type,
    currency,
    operated_at
) VALUES (
             '00000000-0000-0000-0000-000000000010',
             '40000000-0000-0000-0000-000000000004',
             700.00,
             'DEPOSIT',
             'EUR',
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
             '00000000-0000-0000-0000-000000000011',
             '00000000-0000-0000-0000-000000000010',
             'FRAUD',
             'HIGH',
             700.00,
             now(),
             'NEW'
         );

-- Удаление родительской записи
-- Ожидаемый результат: ошибка или каскадное удаление
DELETE FROM cash_operations
WHERE id = '00000000-0000-0000-0000-000000000010';
