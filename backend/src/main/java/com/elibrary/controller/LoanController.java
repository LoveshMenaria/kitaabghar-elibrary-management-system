package com.elibrary.controller;
import com.elibrary.dto.LoanRequest;
import com.elibrary.model.Loan;
import com.elibrary.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/loans") @RequiredArgsConstructor @PreAuthorize("hasRole('ADMIN')")
public class LoanController {
    private final LoanService service;
    @GetMapping public List<Loan> all() { return service.all(); }
    @PostMapping public Loan issue(@Valid @RequestBody LoanRequest request) { return service.issue(request); }
    @PutMapping("/{id}/return") public Loan returnBook(@PathVariable Long id) { return service.returnBook(id); }
}
