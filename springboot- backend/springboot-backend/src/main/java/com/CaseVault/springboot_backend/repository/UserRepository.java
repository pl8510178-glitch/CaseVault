package com.CaseVault.springboot_backend.repository;

import com.CaseVault.springboot_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByOfficerId(String officerId);

    boolean existsByOfficerId(String officerId);
}