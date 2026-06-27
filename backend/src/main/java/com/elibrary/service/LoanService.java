package com.elibrary.service;

import com.elibrary.dto.LoanRequest;
import com.elibrary.model.*;
import com.elibrary.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service @RequiredArgsConstructor
public class LoanService {
    private final LoanRepository loans; private final BookRepository books; private final MemberRepository members;

    @Transactional
    public Loan issue(LoanRequest request) {
        Book book = books.findById(request.bookId()).orElseThrow(() -> new IllegalArgumentException("Book not found"));
        Member member = members.findById(request.memberId()).orElseThrow(() -> new IllegalArgumentException("Member not found"));
        if (!member.isActive()) throw new IllegalStateException("Member is inactive");
        if (book.getAvailableCopies() < 1) throw new IllegalStateException("No copy is currently available");
        LocalDate due = request.dueDate() == null ? LocalDate.now().plusDays(14) : request.dueDate();
        if (due.isBefore(LocalDate.now())) throw new IllegalArgumentException("Due date cannot be in the past");
        book.setAvailableCopies(book.getAvailableCopies() - 1); books.save(book);
        return loans.save(Loan.builder().book(book).member(member).issuedDate(LocalDate.now()).dueDate(due).status(LoanStatus.BORROWED).build());
    }

    @Transactional
    public Loan returnBook(Long id) {
        Loan loan = loans.findById(id).orElseThrow(() -> new IllegalArgumentException("Loan not found"));
        if (loan.getStatus() == LoanStatus.RETURNED) throw new IllegalStateException("Book has already been returned");
        loan.setReturnedDate(LocalDate.now()); loan.setStatus(LoanStatus.RETURNED);
        Book book = loan.getBook(); book.setAvailableCopies(Math.min(book.getTotalCopies(), book.getAvailableCopies() + 1)); books.save(book);
        return loans.save(loan);
    }

    @Transactional
    public List<Loan> all() {
        List<Loan> result = loans.findAllByOrderByIssuedDateDesc();
        result.stream().filter(l -> l.getStatus() == LoanStatus.BORROWED && l.getDueDate().isBefore(LocalDate.now()))
                .forEach(l -> l.setStatus(LoanStatus.OVERDUE));
        return loans.saveAll(result);
    }
}

