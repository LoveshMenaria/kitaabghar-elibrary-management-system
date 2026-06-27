package com.elibrary.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Entity @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Book {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @NotBlank @Column(nullable = false) private String title;
    @NotBlank @Column(nullable = false) private String author;
    @NotBlank @Column(nullable = false, unique = true, length = 64) private String isbn;
    private String category;
    @Column(length = 2000) private String description;
    @DecimalMin("0.00") private BigDecimal price;
    @DecimalMin("0.0") @DecimalMax("5.0") private Double rating;
    private String coverPath;
    private String pdfPath;
    @Min(1) @Column(nullable = false) private int totalCopies;
    @Min(0) @Column(nullable = false) private int availableCopies;
    @Column(nullable = false, columnDefinition = "boolean default false") private boolean archived;

    @PrePersist @PreUpdate
    void defaults() {
        if (price == null) price = BigDecimal.ZERO;
        if (rating == null) rating = 0.0;
    }
}
