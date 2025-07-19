        package com.hotel.booking.exception;

        import io.jsonwebtoken.ExpiredJwtException;
        import org.springframework.web.bind.annotation.ExceptionHandler;
        import org.springframework.web.bind.annotation.RestControllerAdvice;
        import org.springframework.http.ResponseEntity;
        import org.springframework.http.HttpStatus;
        import java.util.Map;

        @RestControllerAdvice
        public class GlobalExceptionHandler {

            @ExceptionHandler(ExpiredJwtException.class)
            public ResponseEntity<?> handleExpiredJwt(ExpiredJwtException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "JWT expired"));
            }

            // Handle specific exceptions for better error messages
            @ExceptionHandler(NumberFormatException.class)
            public ResponseEntity<?> handleNumberFormatException(NumberFormatException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid ID format: " + ex.getMessage()));
            }

            @ExceptionHandler(RuntimeException.class) // Catch RuntimeExceptions from orElseThrow
            public ResponseEntity<?> handleRuntimeException(RuntimeException ex) {
                // You might want to refine this to catch more specific custom exceptions
                // For now, this catches "User not found", "Room not found", etc.
                return ResponseEntity.status(HttpStatus.NOT_FOUND) // Or HttpStatus.BAD_REQUEST depending on context
                        .body(Map.of("message", ex.getMessage()));
            }

            // Fallback for any other unhandled exceptions
            @ExceptionHandler(Exception.class)
            public ResponseEntity<?> handleGenericException(Exception ex) {
                ex.printStackTrace(); // Log the full stack trace for debugging
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "An unexpected error occurred: " + ex.getMessage()));
            }
        }
        