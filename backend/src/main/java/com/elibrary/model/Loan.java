package com.elibrary.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Loan {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false, fetch = FetchType.EAGER) private Book book;
    @ManyToOne(optional = false, fetch = FetchType.EAGER) private Member member;
    @Column(nullable = false) private LocalDate issuedDate;
    @Column(nullable = false) private LocalDate dueDate;
    private LocalDate returnedDate;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private LoanStatus status;
}

