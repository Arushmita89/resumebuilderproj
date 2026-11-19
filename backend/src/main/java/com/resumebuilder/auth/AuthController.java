package com.resumebuilder.auth;

import com.resumebuilder.security.JwtService;
import com.resumebuilder.user.User;
import com.resumebuilder.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final int RESET_TOKEN_EXPIRY_MINUTES = 30;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, PasswordResetTokenRepository resetTokenRepository,
                           PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public AuthDtos.AuthResponse register(@Valid @RequestBody AuthDtos.RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }
        User user = new User();
        user.setEmail(email);
        user.setFullName(request.fullName().trim());
        user.setPassword(passwordEncoder.encode(request.password()));
        user = userRepository.save(user);
        return respond(user);
    }

    @PostMapping("/login")
    public AuthDtos.AuthResponse login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        return respond(user);
    }

    @GetMapping("/me")
    public AuthDtos.UserDto me(Authentication authentication) {
        return toDto(currentUser(authentication));
    }

    @PutMapping("/profile")
    public AuthDtos.UserDto updateProfile(Authentication authentication,
                                          @Valid @RequestBody AuthDtos.UpdateProfileRequest request) {
        User user = currentUser(authentication);
        user.setFullName(request.fullName().trim());
        return toDto(userRepository.save(user));
    }

    @PutMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(Authentication authentication,
                               @Valid @RequestBody AuthDtos.ChangePasswordRequest request) {
        User user = currentUser(authentication);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New passwords do not match");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @PostMapping("/forgot-password")
    @Transactional
    public AuthDtos.ForgotPasswordResponse forgotPassword(
            @Valid @RequestBody AuthDtos.ForgotPasswordRequest request) {
        String email = request.email().trim().toLowerCase();
        return userRepository.findByEmail(email)
                .map(user -> {
                    resetTokenRepository.deleteByUser(user);
                    String token = newToken();
                    PasswordResetToken resetToken = new PasswordResetToken();
                    resetToken.setUser(user);
                    resetToken.setTokenHash(sha256(token));
                    resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(RESET_TOKEN_EXPIRY_MINUTES));
                    resetTokenRepository.save(resetToken);
                    return new AuthDtos.ForgotPasswordResponse("/reset-password?token=" + token,
                            RESET_TOKEN_EXPIRY_MINUTES);
                })
                .orElseGet(() -> new AuthDtos.ForgotPasswordResponse(null, RESET_TOKEN_EXPIRY_MINUTES));
    }

    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void resetPassword(@Valid @RequestBody AuthDtos.ResetPasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
        }
        PasswordResetToken resetToken = resetTokenRepository.findByTokenHash(sha256(request.token()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "This reset link is invalid or has already been used"));
        if (resetToken.getUsedAt() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This reset link has already been used");
        }
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This reset link has expired. Request a new one.");
        }
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        resetToken.setUsedAt(LocalDateTime.now());
        resetTokenRepository.save(resetToken);
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));
    }

    private AuthDtos.AuthResponse respond(User user) {
        return new AuthDtos.AuthResponse(jwtService.generateToken(user.getEmail(), user.getId()), toDto(user));
    }

    private AuthDtos.UserDto toDto(User user) {
        return new AuthDtos.UserDto(user.getId(), user.getEmail(), user.getFullName());
    }

    private String newToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }
}