FROM eclipse-temurin:17-jdk
ARG JAR_FILE=target/incident-service-1.0.0.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
