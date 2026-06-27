package com.elibrary.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Entity @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Member {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @NotBlank @Column(nullable = false) private String name;
    @Email @NotBlank @Column(nullable = false, unique = true) private String email;
    @NotBlank private String phone;
    @Column(nullable = false) private LocalDate joinedDate;
    @Column(nullable = false) private boolean active;
    @PrePersist void defaults() { if (joinedDate == null) joinedDate = LocalDate.now(); }
}

