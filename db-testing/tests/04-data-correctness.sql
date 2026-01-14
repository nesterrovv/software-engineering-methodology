-- 4. Проверка правильности данных
-- Вставка данных некорректного типа

-- Ожидаемый результат: ошибка типа данных
INSERT INTO complaints (
    id,
    category,
    description,
    reported_at,
    source,
    status
) VALUES (
             'not-a-uuid',
             'SERVICE',
             'Invalid UUID test',
             now(),
             'CLIENT',
             'OPEN'
         );
