package com.elibrary.config;

import com.elibrary.model.AppUser;
import com.elibrary.model.Book;
import com.elibrary.model.Member;
import com.elibrary.model.Role;
import com.elibrary.repository.AppUserRepository;
import com.elibrary.repository.BookRepository;
import com.elibrary.repository.MemberRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.math.BigDecimal;

@Configuration
public class DataSeeder {
    @Bean CommandLineRunner seed(AppUserRepository users, BookRepository books, MemberRepository members, PasswordEncoder encoder) {
        return args -> {
            if (users.count() == 0) users.save(AppUser.builder().username("admin").password(encoder.encode("admin123")).role(Role.ADMIN).build());
            if (books.count() == 0) {
                books.save(Book.builder().title("Clean Code").author("Robert C. Martin").isbn("9780132350884").category("Programming").description("A handbook of practical habits for writing readable, maintainable software.").price(new BigDecimal("499.00")).rating(4.8).totalCopies(5).availableCopies(5).build());
                books.save(Book.builder().title("The Pragmatic Programmer").author("David Thomas").isbn("9780135957059").category("Programming").description("Timeless advice for developers who want to think clearly and build better systems.").price(new BigDecimal("599.00")).rating(4.7).totalCopies(3).availableCopies(3).build());
            }
            if (members.count() == 0) members.save(Member.builder().name("Demo Member").email("member@example.com").phone("9876543210").active(true).build());
        };
    }
}
