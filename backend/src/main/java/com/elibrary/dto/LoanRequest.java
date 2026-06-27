package com.elibrary.dto;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
public record LoanRequest(@NotNull Long bookId, @NotNull Long memberId, LocalDate dueDate) {}

