package com.CaseVault.springboot_backend.service;

import com.CaseVault.springboot_backend.model.User;
import com.CaseVault.springboot_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(
            String officerId,
            String password,
            String mobile,
            String fullName,
            String organization,
            String role
    ) {

        if (userRepository.existsByOfficerId(officerId)) {
            throw new IllegalArgumentException("Officer ID already exists.");
        }

        String hashedPassword = passwordEncoder.encode(password);

        User user = new User(
                officerId,
                hashedPassword,
                mobile,
                fullName,
                organization,
                role
        );

        return userRepository.save(user);
    }

    public User findByOfficerId(String officerId) {

        return userRepository
                .findByOfficerId(officerId)
                .orElse(null);
    }
}