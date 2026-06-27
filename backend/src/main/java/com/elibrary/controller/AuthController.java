package com.elibrary.controller;

import com.elibrary.dto.*;
import com.elibrary.model.AppUser;
import com.elibrary.model.Role;
import com.elibrary.repository.AppUserRepository;
import com.elibrary.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        var user = userDetailsService.loadUserByUsername(request.username());
        String role = user.getAuthorities().stream().findFirst().map(Object::toString).orElse("ROLE_LIBRARIAN").replace("ROLE_", "");
        return new AuthResponse(jwtService.generate(user), user.getUsername(), role);
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegistrationRequest request) {
        String username = request.username().trim();
        if (users.existsByUsernameIgnoreCase(username)) {
            throw new IllegalArgumentException("Username is already registered");
        }
        users.save(AppUser.builder()
                .username(username)
                .password(passwordEncoder.encode(request.password()))
                .role(Role.MEMBER)
                .build());
        var user = userDetailsService.loadUserByUsername(username);
        return new AuthResponse(jwtService.generate(user), username, Role.MEMBER.name());
    }
}
