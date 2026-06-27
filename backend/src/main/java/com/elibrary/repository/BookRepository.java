package com.elibrary.repository;
import com.elibrary.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByArchivedFalse();

    @Query("""
            select b from Book b
            where b.archived = false
              and (
                lower(b.title) like lower(concat('%', :query, '%'))
                or lower(b.author) like lower(concat('%', :query, '%'))
                or lower(b.isbn) like lower(concat('%', :query, '%'))
                or lower(coalesce(b.category, '')) like lower(concat('%', :query, '%'))
              )
            """)
    List<Book> searchActive(@Param("query") String query);

    List<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCaseOrIsbnContainingIgnoreCase(String title, String author, String isbn);
    List<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCaseOrCategoryContainingIgnoreCase(String title, String author, String category);
}
