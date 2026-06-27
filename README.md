# KitaabGhar eLibrary Management System

A full-stack library desk for managing books, members, borrowing, returns, and overdue loans.

## Stack

- Java 21, Spring Boot 3.5.7, Spring Security, JWT, Spring Data JPA
- React 19.2 + Vite 8
- MySQL 8.4
- Maven 3.9+ and Node.js 22.12+

## Features

- Secure JWT login with BCrypt password hashing
- Dashboard counts and recent activity
- Searchable book catalogue with copy availability
- Member registration and active/inactive status
- Issue, return, and overdue tracking
- Validation and safe-delete business rules
- Responsive interface for desktop and mobile
- Automatic database schema creation and starter records

## Run locally

## Open in IntelliJ IDEA

Do not open the extracted folder as an existing IntelliJ project. It intentionally does not contain machine-specific `.idea` files.

1. In IntelliJ, choose **File → Open**.
2. Select the root `pom.xml` (beside this README), not the ZIP file.
3. Choose **Open as Project** when prompted.
4. In **File → Project Structure → Project**, select a Java 21 JDK.
5. Wait for Maven dependency indexing to finish.
6. Run `ELibraryApplication` from the `backend` module.

If the folder was already opened incorrectly, close it, delete only its generated `.idea` folder, and reopen the root `pom.xml` using the steps above.

### 1. Start MySQL

With Docker Desktop installed, from this folder run:

```powershell
docker compose up -d mysql
```

Without Docker, create a MySQL database named `elibrary` and update the credentials in `backend/src/main/resources/application.properties` or set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`.

### 2. Start the backend

```powershell
cd backend
mvn spring-boot:run
```

The REST API starts at `http://localhost:8080/api`.

### 3. Start the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

Demo login: `admin` / `admin123`

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/elibrary...` | JDBC connection URL |
| `DB_USERNAME` | `root` | MySQL user |
| `DB_PASSWORD` | `root` | MySQL password |
| `JWT_SECRET` | development value | JWT signing key (change in production) |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed browser origin |
| `VITE_API_URL` | `http://localhost:8080/api` | Frontend API endpoint |

## Main API routes

- `POST /api/auth/login`
- `GET/POST/PUT/DELETE /api/books`
- `GET/POST/PUT/DELETE /api/members`
- `GET/POST /api/loans`
- `PUT /api/loans/{id}/return`
- `GET /api/dashboard`

All routes except login require `Authorization: Bearer <token>`.

## Project structure

```text
backend/src/main/java/com/elibrary
├── config       Security, CORS, demo data
├── controller   REST endpoints
├── dto          API request/response objects
├── exception    Consistent error responses
├── model        JPA entities and enums
├── repository   Database access
├── security     JWT creation and filtering
└── service      Loan business rules

frontend/src
├── App.jsx       Pages and components
├── api.js        Authenticated API client
└── styles.css    Responsive visual design
```

## Production notes

Change the seeded password and JWT secret, use Flyway migrations instead of `ddl-auto=update`, enable HTTPS, restrict CORS, and store secrets in environment variables before deployment.
