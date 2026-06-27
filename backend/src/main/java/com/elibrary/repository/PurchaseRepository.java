package com.elibrary.repository;

import com.elibrary.model.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    List<Purchase> findByUserUsernameOrderByPurchasedAtDesc(String username);
    List<Purchase> findAllByOrderByPurchasedAtDesc();
    boolean existsByUserUsernameAndBookId(String username, Long bookId);

    @Query("select coalesce(sum(p.pricePaid), 0) from Purchase p")
    BigDecimal totalSales();
}
