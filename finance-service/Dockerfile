FROM eclipse-temurin:17-jdk
ARG JAR_FILE=target/finance-service-1.0.0.jar
COPY ${JAR_FILE} finance-app.jar
ENTRYPOINT ["java","-jar","/finance-app.jar"]
