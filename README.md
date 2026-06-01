# Grades Dashboard

A web application for managing student grades and attendance. Students can submit subject records and view their GPA; administrators can view analytics, identify toppers and low-attendance students, update records, and delete students.

---

## Features

- **Student portal** — submit subject grades/attendance, view GPA and per-subject results
- **Admin portal** — analytics dashboard, topper list, low-attendance alerts, search, update, and delete
- **Authentication** — bcrypt-hashed passwords, separate student and admin roles
- **Grading engine** — automatic letter grade and pass/fail calculation (also available as standalone Python functions)

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ |
| Oracle Database XE | 21c (running on `localhost:1521/xe`) |
| Python | 3.7+ (only needed for Python utilities/tests) |

---

## Project Structure

```
grades_dashboard/
├── backend/            # Express.js REST API (port 3000)
│   ├── server.js       # Route handlers
│   ├── db.js           # Oracle connection
│   └── database.test.js
├── frontend/           # Static HTML/CSS/JS served by the backend
│   ├── login.html      # Login / register page
│   ├── index.html      # Student dashboard
│   └── admin.html      # Admin dashboard
├── python/             # Standalone Python grade/attendance utilities
│   ├── result.py
│   ├── validation.py
│   └── test_result.py
├── sql/
│   ├── create_table.sql  # Schema definitions
│   └── insert_data.sql   # Sample data (20 students, 80 subject records)
└── package.json
```

---

## Setup

### 1. Install Node.js dependencies

```bash
npm install
cd backend && npm install
cd ..
```

### 2. Configure the database connection

Open [backend/db.js](backend/db.js) and update the credentials to match your Oracle XE instance:

```js
user: "system",
password: "your_password",
connectString: "localhost:1521/xe"
```

> **Tip:** To avoid storing credentials in source code, move them to a `.env` file and read them with `process.env`.

### 3. Create the database schema

Connect to your Oracle instance and run the schema script:

```bash
sqlplus system/your_password@localhost:1521/xe @sql/create_table.sql
```

### 4. (Optional) Load sample data

```bash
sqlplus system/your_password@localhost:1521/xe @sql/insert_data.sql
```

This inserts 20 students with 4 subjects each and 10 pre-created login accounts.

---

## Running the App

```bash
node backend/server.js
```

Then open your browser to:

```
http://localhost:3000
```

---

## Default Accounts (sample data)

| Username | Password | Role |
|----------|----------|------|
| Liam Johnson | `password123` | Student |
| Emma Williams | `password123` | Student |
| *(any sample student name)* | `password123` | Student |

To create an **admin** account, click "Register" on the login page, check "Register as Admin", and enter the admin passcode `admin123`.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/login` | Authenticate a user |
| POST | `/register` | Create a new account |
| POST | `/student` | Add a subject record |
| GET | `/students` | List all students with GPA |
| GET | `/student/:id` | Get a student by ID |
| GET | `/student/:name/subjects` | Get all subjects for a student |
| GET | `/student/:name/gpa` | Get GPA and overall attendance |
| PUT | `/student/:id` | Update a subject record |
| DELETE | `/student/:id` | Delete a student and all their data |
| GET | `/toppers` | Students with GPA ≥ 90 |
| GET | `/analytics` | Pass/fail counts and rates |
| GET | `/low-attendance` | Students with attendance < 75% |
| GET | `/search?name=` | Search students by name |

---

## Grading Rules

| Score | Letter Grade |
|-------|-------------|
| ≥ 90 | A |
| ≥ 75 | B |
| ≥ 50 | C |
| < 50 | Fail |

A student **passes** a subject if grades ≥ 50 **and** attendance ≥ 75%. The fail reason is recorded as *Low Grades*, *Low Attendance*, or *Both*.

---

## Testing

**Backend (Jest + Supertest):**

```bash
cd backend
npm test
```

**Python utilities (pytest):**

```bash
cd python
python -m pytest test_result.py
```
