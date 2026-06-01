-- Simplified students table with primary key and student name, gpa and overall attendance
create table students (
    id Number generated always as identity primary key,
    name varchar2(50) UNIQUE NOT NULL,
    gpa float,
    overall_attendance number(3)
);

commit;

-- New subjects table with relationship to students
-- Each subject has: attendance, grade per that subject and result for subject
create table subjects (
    id Number generated always as identity primary key,
    student_id Number,
    subject varchar2(20),
    grades number(3),
    grade varchar2(5),
    attendance number(3),
    result varchar2(100),
    constraint fk_student foreign key (student_id) references students(id)
);

commit;

CREATE TABLE login_users (
    USER_ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USERNAME VARCHAR2(50) UNIQUE NOT NULL,
    ADMIN NUMBER(1) DEFAULT 0 NOT NULL,
    CONSTRAINT chk_admin CHECK (admin IN (0, 1)),
    PASSWORD_HASH VARCHAR2(255) NOT NULL,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
commit;
