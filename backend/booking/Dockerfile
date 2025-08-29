# Step 1: Use a Java 21 base image
FROM eclipse-temurin:21-jdk-alpine

# Step 2: Set working directory inside the container
WORKDIR /app

# Step 3: Copy Maven wrapper and pom.xml (so dependencies cache)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Step 3.1: Give execution permission to mvnw (important!)
RUN chmod +x mvnw

# Step 4: Download dependencies offline
RUN ./mvnw dependency:go-offline

# Step 5: Copy all your source code
COPY . .

# Step 6: Build the app
RUN ./mvnw clean package -DskipTests

# Step 7: Expose the port
ENV PORT 8080
EXPOSE 8080

# Step 8: Run the Spring Boot jar
CMD ["java", "-jar", "target/booking-0.0.1-SNAPSHOT.jar"]
