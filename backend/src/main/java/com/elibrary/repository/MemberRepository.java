package com.elibrary.repository;
import com.elibrary.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface MemberRepository extends JpaRepository<Member, Long> {
    List<Member> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);
}

