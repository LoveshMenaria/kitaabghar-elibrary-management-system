package com.elibrary.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegistrationRequest(
        @NotBlank
        @Size(min = 3, max = 50)
        @Pattern(regexp = "^[A-Za-z0-9._-]+$", message = "may only contain letters, numbers, dots, underscores, and hyphens")
        String username,
        @NotBlank
        @Size(min = 8, max = 72)
        String password
) {}
