# Casino MIS Backend MVP


* **incident-service** – обработка UC‑21, UC‑3
* **finance-service** – обработка UC‑10, UC‑9

## Пререквезиты

* JDK 17
* Apache Maven 3.9.9
* Docker 28.0.1

## Стек

* Spring Boot, Spring Data, Spring Security
* PostgreSQL + Liquibase
* MinIO (S3‑compatible)
* Testcontainers, JUnit

## Сборка и запуск

```shell
mvn clean package
docker compose up --build -d
```

## OpenAPI документация:

* http://localhost:8080/swagger-ui/index.html - incident-service
* http://localhost:8081/swagger-ui/index.html - finance-service

## Проверка работоспособности в Postman

* Импортировать себе окружение ```Casino_MIS_Local_v2.postman_environment.json```
* Импортировать пример коллекции ```Casino_MIS_API_v2.postman_collection.json```

## Просмотр логов:

```shell
docker compose logs -f finance-service
docker compose logs -f incident-service
```
