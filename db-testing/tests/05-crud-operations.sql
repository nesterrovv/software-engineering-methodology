-- 5. Проверка корректных запросов к БД

-- Добавление
INSERT INTO complaints (
    id,
    category,
    description,
    reported_at,
    source,
    status,
    reporter_name
) VALUES (
             '00000000-0000-0000-0000-000000000020',
             'PAYMENT',
             'Incorrect transaction',
             now(),
             'CLIENT',
             'OPEN',
             'Alice'
         );

-- Обновление
UPDATE complaints
SET status = 'RESOLVED'
WHERE id = '00000000-0000-0000-0000-000000000020';

-- Удаление
DELETE FROM complaints
WHERE id = '00000000-0000-0000-0000-000000000020';
