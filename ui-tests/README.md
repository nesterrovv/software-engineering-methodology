# UI Tests (Selenium)

Запуск:
```
mvn -f ui-tests/pom.xml test
```

Переменные окружения:
- `UI_BASE_URL` (по умолчанию `http://localhost:5173`)
- `UI_API_BASE_URL` (по умолчанию пусто, использовать прокси)
- `API_BASE_URL` (по умолчанию `http://localhost:8080`) — для подготовки данных
- `UI_USERNAME` (по умолчанию `admin`)
- `UI_PASSWORD` (по умолчанию `admin`)
- `UI_BROWSER` (`chrome`, `firefox`, `edge`; по умолчанию `chrome`)
- `UI_HEADLESS` (`true`/`false`, по умолчанию `true`)
- `CHROME_DRIVER_PATH`, `GECKO_DRIVER_PATH`, `EDGE_DRIVER_PATH` (если драйверы не в PATH)

Артефакты:
- Скриншоты при падении сохраняются в `ui-tests/artifacts/`.
