package com.CaseVault.springboot_backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String officerId;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String fullName;

    private String aadhaar;

    private String organization;

    private String role;

    private String mobile;

    @Column(nullable = false)
    private boolean verified = false;

    @Column(nullable = false)
    private boolean biometricCompleted = false;

    public User() {
    }

    // Constructor used during account registration
    public User(
            String officerId,
            String passwordHash,
            String mobile,
            String fullName,
            String organization,
            String role
    ) {
        this.officerId = officerId;
        this.passwordHash = passwordHash;
        this.mobile = mobile;
        this.fullName = fullName;
        this.organization = organization;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public String getOfficerId() {
        return officerId;
    }

    public void setOfficerId(String officerId) {
        this.officerId = officerId;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getAadhaar() {
        return aadhaar;
    }

    public void setAadhaar(String aadhaar) {
        this.aadhaar = aadhaar;
    }

    public String getOrganization() {
        return organization;
    }

    public void setOrganization(String organization) {
        this.organization = organization;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public boolean isBiometricCompleted() {
        return biometricCompleted;
    }

    public void setBiometricCompleted(boolean biometricCompleted) {
        this.biometricCompleted = biometricCompleted;
    }
}