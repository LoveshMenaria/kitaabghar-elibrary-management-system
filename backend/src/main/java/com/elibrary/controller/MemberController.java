package com.elibrary.controller;

import com.elibrary.model.*;
import com.elibrary.repository.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/members") @RequiredArgsConstructor @PreAuthorize("hasRole('ADMIN')")
public class MemberController {
    private final MemberRepository members; private final LoanRepository loans;
    @GetMapping public List<Member> all(@RequestParam(defaultValue = "") String q) { return q.isBlank() ? members.findAll() : members.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(q,q); }
    @PostMapping public Member create(@Valid @RequestBody Member member) { member.setId(null); member.setActive(true); return members.save(member); }
    @PutMapping("/{id}") public Member update(@PathVariable Long id, @Valid @RequestBody Member input) {
        Member member = members.findById(id).orElseThrow(() -> new IllegalArgumentException("Member not found"));
        member.setName(input.getName()); member.setEmail(input.getEmail()); member.setPhone(input.getPhone()); member.setActive(input.isActive()); return members.save(member);
    }
    @DeleteMapping("/{id}") public void delete(@PathVariable Long id) {
        if (loans.existsByMemberIdAndStatus(id, LoanStatus.BORROWED) || loans.existsByMemberIdAndStatus(id, LoanStatus.OVERDUE)) throw new IllegalStateException("Return active loans before deleting this member");
        members.deleteById(id);
    }
}
