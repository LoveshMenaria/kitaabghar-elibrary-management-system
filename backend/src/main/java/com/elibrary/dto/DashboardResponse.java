package com.elibrary.dto;
import java.math.BigDecimal;
public record DashboardResponse(long books, long members, long activeLoans, long overdueLoans, long purchases, BigDecimal sales) {}
