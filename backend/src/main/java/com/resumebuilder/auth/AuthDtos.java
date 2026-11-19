package com.resumebuilder.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthDtos() {

    public record RegisterRequest(
            @NotBlank(message = "Full name is required")
            String fullName,
            @NotBlank @Email(message = "A valid email is required")
            String email,
            @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
            String password) {
    }

    public record LoginRequest(
            @NotBlank @Email(message = "A valid email is required")
            String email,
            @NotBlank String password) {
    }

    public record UpdateProfileRequest(
            @NotBlank(message = "Full name is required")
            @Size(max = 120, message = "Full name must be 120 characters or fewer")
            String fullName) {
    }

    public record ChangePasswordRequest(
            @NotBlank(message = "Current password is required")
            String currentPassword,
            @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
            String newPassword,
            @NotBlank(message = "Please confirm your new password")
            String confirmPassword) {
    }

    public record ForgotPasswordRequest(
            @NotBlank @Email(message = "A valid email is required")
            String email) {
    }

    public record ForgotPasswordResponse(String resetUrl, int expiresInMinutes) {
    }

    public record ResetPasswordRequest(
            @NotBlank(message = "Reset token is required")
            String token,
            @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
            String newPassword,
            @NotBlank(message = "Please confirm your new password")
            String confirmPassword) {
    }

    public record UserDto(Long id, String email, String fullName) {
    }

    public record AuthResponse(String token, UserDto user) {
    }
}