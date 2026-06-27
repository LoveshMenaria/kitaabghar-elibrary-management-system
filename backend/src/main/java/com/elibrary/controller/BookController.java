package com.elibrary.controller;

import com.elibrary.model.*;
import com.elibrary.repository.*;
import com.elibrary.dto.PurchaseResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.net.URLEncoder;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/books") @RequiredArgsConstructor
public class BookController {
    private final BookRepository books; private final LoanRepository loans; private final PurchaseRepository purchases; private final AppUserRepository users;
    @Value("${app.upload-dir}") private String uploadDir;

    @GetMapping public List<Book> all(@RequestParam(defaultValue = "") String q) {
        return q.isBlank() ? books.findByArchivedFalse() : books.searchActive(q);
    }

    @GetMapping("/purchases")
    @PreAuthorize("hasAnyRole('MEMBER', 'LIBRARIAN')")
    public List<PurchaseResponse> myPurchases(Authentication authentication) {
        return purchases.findByUserUsernameOrderByPurchasedAtDesc(authentication.getName()).stream().map(PurchaseResponse::from).toList();
    }

    @GetMapping("/purchases/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<PurchaseResponse> allPurchases() {
        return purchases.findAllByOrderByPurchasedAtDesc().stream().map(PurchaseResponse::from).toList();
    }

    @PostMapping @PreAuthorize("hasRole('ADMIN')")
    public Book create(@Valid @RequestBody Book input) {
        Book book = Book.builder().build();
        applyBookInput(book, input);
        book.setId(null);
        book.setAvailableCopies(book.getTotalCopies());
        return books.save(book);
    }
    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public Book update(@PathVariable Long id, @Valid @RequestBody Book input) {
        Book book = books.findById(id).orElseThrow(() -> new IllegalArgumentException("Book not found"));
        int borrowed = book.getTotalCopies() - book.getAvailableCopies();
        if (input.getTotalCopies() < borrowed) throw new IllegalStateException("Total copies cannot be lower than borrowed copies (" + borrowed + ")");
        applyBookInput(book, input);
        book.setTotalCopies(input.getTotalCopies()); book.setAvailableCopies(input.getTotalCopies() - borrowed); return books.save(book);
    }
    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        Book book = books.findById(id).orElseThrow(() -> new IllegalArgumentException("Book not found"));
        if (loans.existsByBookIdAndStatus(id, LoanStatus.BORROWED) || loans.existsByBookIdAndStatus(id, LoanStatus.OVERDUE)) throw new IllegalStateException("Return active loans before removing this book");
        book.setArchived(true);
        books.save(book);
    }

    @PostMapping("/{id}/purchase")
    @PreAuthorize("hasAnyRole('MEMBER', 'LIBRARIAN')")
    @Transactional
    public PurchaseResponse purchase(@PathVariable Long id, Authentication authentication) {
        if (purchases.existsByUserUsernameAndBookId(authentication.getName(), id)) throw new IllegalStateException("You already purchased this book");
        AppUser user = users.findByUsername(authentication.getName()).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Book book = books.findById(id).orElseThrow(() -> new IllegalArgumentException("Book not found"));
        if (book.getAvailableCopies() < 1) throw new IllegalStateException("This book is out of stock");
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        books.save(book);
        return PurchaseResponse.from(purchases.save(Purchase.builder().user(user).book(book).build()));
    }

    @PostMapping("/{id}/cover")
    @PreAuthorize("hasRole('ADMIN')")
    public Book uploadCover(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws Exception {
        Book book = books.findById(id).orElseThrow(() -> new IllegalArgumentException("Book not found"));
        if (file.isEmpty() || file.getContentType() == null || !file.getContentType().startsWith("image/")) throw new IllegalArgumentException("Upload a valid cover image");
        book.setCoverPath(store(file, "covers"));
        return books.save(book);
    }

    @PostMapping("/{id}/pdf")
    @PreAuthorize("hasRole('ADMIN')")
    public Book uploadPdf(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws Exception {
        Book book = books.findById(id).orElseThrow(() -> new IllegalArgumentException("Book not found"));
        if (!isPdf(file)) throw new IllegalArgumentException("Upload a valid PDF file");
        book.setPdfPath(store(file, "pdfs"));
        return books.save(book);
    }

    @GetMapping("/{id}/cover")
    public ResponseEntity<Resource> cover(@PathVariable Long id) throws Exception {
        Book book = books.findById(id).orElseThrow(() -> new IllegalArgumentException("Book not found"));
        if (book.getCoverPath() == null) throw new IllegalArgumentException("No cover image uploaded");
        return fileResponse(book.getCoverPath(), true, "cover-" + id);
    }

    @GetMapping("/{id}/read")
    public ResponseEntity<Resource> read(@PathVariable Long id, Authentication authentication) throws Exception {
        Book book = readableBook(id, authentication);
        return fileResponse(book.getPdfPath(), true, safeName(book.getTitle()) + ".pdf");
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id, Authentication authentication) throws Exception {
        Book book = readableBook(id, authentication);
        return fileResponse(book.getPdfPath(), false, safeName(book.getTitle()) + ".pdf");
    }

    private Book readableBook(Long id, Authentication authentication) {
        Book book = books.findById(id).orElseThrow(() -> new IllegalArgumentException("Book not found"));
        if (book.getPdfPath() == null) throw new IllegalArgumentException("No PDF uploaded for this book");
        boolean admin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!admin && !purchases.existsByUserUsernameAndBookId(authentication.getName(), id)) throw new IllegalStateException("Purchase this book before reading it");
        return book;
    }

    private String store(MultipartFile file, String folder) throws Exception {
        Path dir = Paths.get(uploadDir).resolve(folder).toAbsolutePath().normalize();
        Files.createDirectories(dir);
        String original = file.getOriginalFilename() == null ? "file" : Paths.get(file.getOriginalFilename()).getFileName().toString();
        String name = UUID.randomUUID() + "-" + original.replaceAll("[^a-zA-Z0-9._-]", "_");
        Path target = dir.resolve(name).normalize();
        file.transferTo(target);
        return folder + "/" + name;
    }

    private ResponseEntity<Resource> fileResponse(String storedPath, boolean inline, String downloadName) throws Exception {
        Path path = Paths.get(uploadDir).resolve(storedPath).toAbsolutePath().normalize();
        Resource resource = new UrlResource(path.toUri());
        if (!resource.exists()) throw new IllegalArgumentException("File not found");
        String contentType = Files.probeContentType(path);
        String disposition = (inline ? "inline" : "attachment") + "; filename=\"" + URLEncoder.encode(downloadName, StandardCharsets.UTF_8) + "\"";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .body(resource);
    }

    private String safeName(String value) {
        return value == null ? "book" : value.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private void applyBookInput(Book book, Book input) {
        book.setTitle(cleanRequired(input.getTitle(), "Title"));
        book.setAuthor(cleanRequired(input.getAuthor(), "Author"));
        book.setIsbn(cleanRequired(input.getIsbn(), "ISBN"));
        book.setCategory(cleanOptional(input.getCategory()));
        book.setDescription(cleanOptional(input.getDescription()));
        book.setPrice(input.getPrice() == null ? BigDecimal.ZERO : input.getPrice());
        book.setRating(input.getRating() == null ? 0.0 : input.getRating());
        book.setTotalCopies(input.getTotalCopies());
    }

    private String cleanRequired(String value, String label) {
        String cleaned = value == null ? "" : value.trim();
        if (cleaned.isBlank()) throw new IllegalArgumentException(label + " is required");
        return cleaned;
    }

    private String cleanOptional(String value) {
        return value == null ? "" : value.trim();
    }

    private boolean isPdf(MultipartFile file) {
        if (file.isEmpty() || file.getOriginalFilename() == null) return false;
        String name = file.getOriginalFilename().toLowerCase();
        String type = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        return name.endsWith(".pdf") || type.equals("application/pdf") || type.equals("application/octet-stream");
    }
}
