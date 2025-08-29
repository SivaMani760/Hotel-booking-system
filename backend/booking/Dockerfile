# Step 1: Use a Maven + Java 21 image for build
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Step 2: Build the app (skip tests for faster build)
RUN mvn clean package -DskipTests

# Step 3: Use lightweight JDK image for running the app
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

# Copy the JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Run the Spring Boot app
CMD ["java", "-jar", "app.jar"]
