FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace
COPY backend/ ./
RUN chmod +x ./mvnw && ./mvnw -q -DskipTests clean package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT exec java -jar /app/app.jar --spring.profiles.active=supabase --server.port=${PORT:-8080} --app.jwt.secret=${APP_JWT_SECRET:?APP_JWT_SECRET required}
