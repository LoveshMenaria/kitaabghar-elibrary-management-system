package com.elibrary.dto;

import com.elibrary.model.Book;
import com.elibrary.model.Purchase;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PurchaseResponse(Long id, Book book, BigDecimal pricePaid, LocalDateTime purchasedAt, String username) {
    public static PurchaseResponse from(Purchase purchase) {
        return new PurchaseResponse(purchase.getId(), purchase.getBook(), purchase.getPricePaid(), purchase.getPurchasedAt(), purchase.getUser().getUsername());
    }
}
