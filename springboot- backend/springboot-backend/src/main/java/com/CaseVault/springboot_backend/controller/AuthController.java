package com.CaseVault.springboot_backend.controller;

import com.CaseVault.springboot_backend.dto.RegisterRequest;
import com.CaseVault.springboot_backend.model.User;
import com.CaseVault.springboot_backend.service.AuthService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        try {

            if (request.getOfficerId() == null ||
                    request.getOfficerId().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of("error", "Officer ID is required."));
            }

            if (request.getPassword() == null ||
                    request.getPassword().length() < 6) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of("error", "Password must be at least 6 characters."));
            }

            if (request.getMobile() == null ||
                    request.getMobile().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of("error", "Registered mobile number is required."));
            }

            User user = authService.register(
                    request.getOfficerId().trim(),
                    request.getPassword(),
                    request.getMobile().trim(),
                    request.getFullName(),
                    request.getOrganization(),
                    request.getRole()
            );

            Map<String, Object> response = new HashMap<>();

            response.put("message", "Account registered successfully.");
            response.put("officerId", user.getOfficerId());
            response.put("fullName", user.getFullName());
            response.put("organization", user.getOrganization());
            response.put("role", user.getRole());

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (IllegalArgumentException error) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", error.getMessage()));

        } catch (Exception error) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Registration failed."));
        }
    }

    @GetMapping("/check/{officerId}")
    public ResponseEntity<?> checkOfficerId(
            @PathVariable String officerId) {

        User user = authService.findByOfficerId(officerId);

        if (user != null) {
            return ResponseEntity.ok(
                    Map.of(
                            "exists", true,
                            "message", "Officer ID already exists."
                    )
            );
        }

        return ResponseEntity.ok(
                Map.of(
                        "exists", false,
                        "message", "Officer ID is available."
                )
        );
    }
}