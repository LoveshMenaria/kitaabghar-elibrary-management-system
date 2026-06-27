package com.elibrary.exception;

import org.springframework.http.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import java.time.Instant;
import java.util.*;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(BadCredentialsException.class)
    ResponseEntity<Map<String,Object>> unauthorized(BadCredentialsException e) { return response(HttpStatus.UNAUTHORIZED, "Invalid username or password"); }
    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    ResponseEntity<Map<String,Object>> badRequest(RuntimeException e) { return response(HttpStatus.BAD_REQUEST, e.getMessage()); }
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<Map<String,Object>> conflict(DataIntegrityViolationException e) { return response(HttpStatus.BAD_REQUEST, "This change conflicts with existing library records. Check duplicate ISBNs or linked purchases/loans."); }
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<Map<String,Object>> uploadTooLarge(MaxUploadSizeExceededException e) { return response(HttpStatus.BAD_REQUEST, "File is too large. Upload a PDF up to 100MB"); }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String,Object>> validation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream().map(x -> x.getField()+": "+x.getDefaultMessage()).findFirst().orElse("Validation failed");
        return response(HttpStatus.BAD_REQUEST, message);
    }
    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String,Object>> error(Exception e) { return response(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected server error"); }
    private ResponseEntity<Map<String,Object>> response(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("timestamp", Instant.now().toString(), "status", status.value(), "message", message));
    }
}
