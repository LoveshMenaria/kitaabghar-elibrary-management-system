package com.elibrary.controller;
import com.elibrary.dto.DashboardResponse;
import com.elibrary.model.LoanStatus;
import com.elibrary.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/dashboard") @RequiredArgsConstructor @PreAuthorize("hasRole('ADMIN')")
public class DashboardController {
    private final BookRepository books; private final MemberRepository members; private final LoanRepository loans; private final PurchaseRepository purchases;
    @GetMapping public DashboardResponse summary() { return new DashboardResponse(books.count(), members.count(), loans.countByStatus(LoanStatus.BORROWED), loans.countByStatus(LoanStatus.OVERDUE), purchases.count(), purchases.totalSales()); }
}
