package com.elibrary.repository;
import com.elibrary.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findAllByOrderByIssuedDateDesc();
    long countByStatus(LoanStatus status);
    boolean existsByBookIdAndStatus(Long bookId, LoanStatus status);
    boolean existsByMemberIdAndStatus(Long memberId, LoanStatus status);
}
