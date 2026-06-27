package com.elibrary.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Purchase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.EAGER, optional = false) private AppUser user;
    @ManyToOne(fetch = FetchType.EAGER, optional = false) private Book book;
    private BigDecimal pricePaid;
    @Column(nullable = false) private LocalDateTime purchasedAt;

    @PrePersist
    void setPurchasedAt() {
        if (purchasedAt == null) purchasedAt = LocalDateTime.now();
        if (pricePaid == null) pricePaid = book.getPrice();
    }
}
