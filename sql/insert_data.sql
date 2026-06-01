-- Insert 20 students (GPA and overall_attendance are averages of their 4 subjects)
INSERT INTO students (name, gpa, overall_attendance) VALUES ('Emma Thompson',     85.8, 82);
INSERT INTO students (name, gpa, overall_attendance) VALUES ('Liam Johnson',      62.5, 74);
INSERT INTO students (name, gpa, overall_attendance) VALUES ('Olivia Williams',   67.5, 86);
INSERT INTO students (name, gpa, overall_attendance) VALUES ('Noah Brown',        61.0, 71);
INSERT INTO students (name, gpa, overall_attendance) VALUES ('Ava Davis',         68.3, 77);
INSERT INTO students (name, gpa, overall_attendance) VALUES ('William Miller',    82.5, 80);
INSERT INTO students (name, gpa, overall_attendance) VALUES ('Isabella Wilson',   92.0, 87);
INSERT INTO students (name, gpa, overall_attendance) VALUES ('James Moore',       69.3, 79);
INSERT INTO students (name, gpa, overall_attendance) VALUES ('Sophia Taylor',     81.5, 78);
INSERT INTO students (name, gpa, overall_attendance) VALUES ('Benjamin Anderson', 84.8, 83);
INSERT INTO students (name, gpa, overall_attendance) VALUES ('Charlotte Harris',  89.8, 90);
INSERT INTO students (name, gpa, overall_attendance) VALUES ('Ethan Martinez',    40.8, 57);
INSERT INTO students (name, gpa, overall_attendance) VALUES ('Mia Thomas',        81.5, 81);
INSERT INTO students (name, gpa, overall_attendance) VALUES ('Alexander Jackson', 94.5, 92);
INSERT INTO students (name, gpa, overall_attendance) VALUES ('Amelia White',      62.5, 71);
INSERT INTO students (name, gpa, overall_attendance) VALUES ('Daniel Garcia',     80.5, 80);
INSERT INTO students (name, gpa, overall_attendance) VALUES ('Harper Robinson',   89.5, 89);
INSERT INTO students (name, gpa, overall_attendance) VALUES ('Lucas Lewis',       52.5, 76);
INSERT INTO students (name, gpa, overall_attendance) VALUES ('Evelyn Lee',        90.3, 90);
INSERT INTO students (name, gpa, overall_attendance) VALUES ('Jackson Walker',    75.3, 76);

commit;

-- Insert 4 subjects per student (80 rows total)
-- Grade:  >=90=A  >=75=B  >=50=C  <50=Fail
-- Result: grades>=50 & att>=75 -> Pass
--         grades< 50 & att>=75 -> Fail (Low Grades)
--         grades>=50 & att< 75 -> Fail (Low Attendance)
--         grades< 50 & att< 75 -> Fail (Low Grades and Low Attendance)
SET DEFINE OFF;

-- Student 1: Emma Thompson
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (1, 'Mathematics',     85, 'B', 78, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (1, 'Science',         92, 'A', 88, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (1, 'English',         78, 'B', 82, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (1, 'History',         88, 'B', 80, 'Pass');

-- Student 2: Liam Johnson
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (2, 'English',         76, 'B', 70, 'Fail (Low Attendance)');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (2, 'History',         51, 'C', 75, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (2, 'Mathematics',     68, 'C', 72, 'Fail (Low Attendance)');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (2, 'Biology',         55, 'C', 78, 'Pass');

-- Student 3: Olivia Williams
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (3, 'Physics',         45, 'Fail', 90, 'Fail (Low Grades)');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (3, 'Chemistry',       88, 'B',    82, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (3, 'Mathematics',     72, 'C',    85, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (3, 'Art',             65, 'C',    88, 'Pass');

-- Student 4: Noah Brown
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (4, 'Mathematics',     79, 'B',    73, 'Fail (Low Attendance)');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (4, 'Geography',       45, 'Fail', 65, 'Fail (Low Grades and Low Attendance)');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (4, 'English',         62, 'C',    70, 'Fail (Low Attendance)');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (4, 'Science',         58, 'C',    76, 'Pass');

-- Student 5: Ava Davis
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (5, 'English',         91, 'A',    87, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (5, 'Biology',         26, 'Fail', 61, 'Fail (Low Grades and Low Attendance)');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (5, 'Chemistry',       82, 'B',    79, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (5, 'Physics',         74, 'C',    82, 'Pass');

-- Student 6: William Miller
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (6, 'Mathematics',     74, 'C',    69, 'Fail (Low Attendance)');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (6, 'Art',             93, 'A',    89, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (6, 'History',         85, 'B',    77, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (6, 'Science',         78, 'B',    83, 'Pass');

-- Student 7: Isabella Wilson
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (7, 'Science',          88, 'B', 83, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (7, 'Computer Science', 96, 'A', 92, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (7, 'Mathematics',      94, 'A', 88, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (7, 'English',          90, 'A', 86, 'Pass');

-- Student 8: James Moore
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (8, 'English',         55, 'C', 77, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (8, 'History',         89, 'B', 85, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (8, 'Mathematics',     72, 'C', 80, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (8, 'Biology',         61, 'C', 74, 'Fail (Low Attendance)');

-- Student 9: Sophia Taylor
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (9, 'Mathematics',     77, 'B', 72, 'Fail (Low Attendance)');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (9, 'Chemistry',       90, 'A', 86, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (9, 'Physics',         83, 'B', 78, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (9, 'Biology',         76, 'B', 75, 'Pass');

-- Student 10: Benjamin Anderson
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (10, 'Physics',        94, 'A', 89, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (10, 'English',        83, 'B', 78, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (10, 'Geography',      75, 'B', 81, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (10, 'History',        87, 'B', 84, 'Pass');

-- Student 11: Charlotte Harris
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (11, 'Mathematics',    91, 'A', 94, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (11, 'Science',        87, 'B', 89, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (11, 'English',        93, 'A', 91, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (11, 'Art',            88, 'B', 87, 'Pass');

-- Student 12: Ethan Martinez
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (12, 'Mathematics',    42, 'Fail', 55, 'Fail (Low Grades and Low Attendance)');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (12, 'Science',        38, 'Fail', 60, 'Fail (Low Grades and Low Attendance)');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (12, 'English',        48, 'Fail', 62, 'Fail (Low Grades and Low Attendance)');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (12, 'History',        35, 'Fail', 50, 'Fail (Low Grades and Low Attendance)');

-- Student 13: Mia Thomas
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (13, 'Biology',        79, 'B', 76, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (13, 'Chemistry',      84, 'B', 81, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (13, 'Physics',        71, 'C', 77, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (13, 'Mathematics',    92, 'A', 88, 'Pass');

-- Student 14: Alexander Jackson
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (14, 'Computer Science', 98, 'A', 95, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (14, 'Mathematics',      95, 'A', 93, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (14, 'Physics',          91, 'A', 89, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (14, 'Science',          94, 'A', 92, 'Pass');

-- Student 15: Amelia White
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (15, 'English',         67, 'C', 72, 'Fail (Low Attendance)');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (15, 'History',         58, 'C', 68, 'Fail (Low Attendance)');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (15, 'Art',             73, 'C', 74, 'Fail (Low Attendance)');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (15, 'Geography',       52, 'C', 71, 'Fail (Low Attendance)');

-- Student 16: Daniel Garcia
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (16, 'Mathematics',     86, 'B', 84, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (16, 'Science',         79, 'B', 78, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (16, 'History',         82, 'B', 80, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (16, 'English',         75, 'B', 76, 'Pass');

-- Student 17: Harper Robinson
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (17, 'Biology',         95, 'A', 92, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (17, 'Chemistry',       88, 'B', 87, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (17, 'Physics',         91, 'A', 90, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (17, 'Mathematics',     84, 'B', 85, 'Pass');

-- Student 18: Lucas Lewis
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (18, 'Mathematics',     44, 'Fail', 78, 'Fail (Low Grades)');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (18, 'English',         61, 'C',    72, 'Fail (Low Attendance)');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (18, 'Science',         56, 'C',    80, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (18, 'History',         49, 'Fail', 75, 'Fail (Low Grades)');

-- Student 19: Evelyn Lee
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (19, 'Art',             96, 'A', 93, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (19, 'English',         89, 'B', 88, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (19, 'History',         91, 'A', 90, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (19, 'Geography',       85, 'B', 87, 'Pass');

-- Student 20: Jackson Walker
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (20, 'Computer Science', 77, 'B', 74, 'Fail (Low Attendance)');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (20, 'Mathematics',      83, 'B', 79, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (20, 'Science',          69, 'C', 77, 'Pass');
INSERT INTO subjects (student_id, subject, grades, grade, attendance, result) VALUES (20, 'English',          72, 'C', 73, 'Fail (Low Attendance)');

SET DEFINE ON;
commit;

-- Insert login accounts for 10 of the 20 students (chosen at random)
-- Password for all accounts: password123
-- Hash generated with bcrypt, 10 salt rounds
INSERT INTO login_users (username, password_hash, admin) VALUES ('Liam Johnson',      '$2b$10$QtpHwEYzwfBvtMldAoxlBOJbo3AEGQKm8xGsYVVxuOBeDe4ifjONC', 0);
INSERT INTO login_users (username, password_hash, admin) VALUES ('Noah Brown',        '$2b$10$QtpHwEYzwfBvtMldAoxlBOJbo3AEGQKm8xGsYVVxuOBeDe4ifjONC', 0);
INSERT INTO login_users (username, password_hash, admin) VALUES ('William Miller',    '$2b$10$QtpHwEYzwfBvtMldAoxlBOJbo3AEGQKm8xGsYVVxuOBeDe4ifjONC', 0);
INSERT INTO login_users (username, password_hash, admin) VALUES ('Isabella Wilson',   '$2b$10$QtpHwEYzwfBvtMldAoxlBOJbo3AEGQKm8xGsYVVxuOBeDe4ifjONC', 0);
INSERT INTO login_users (username, password_hash, admin) VALUES ('Sophia Taylor',     '$2b$10$QtpHwEYzwfBvtMldAoxlBOJbo3AEGQKm8xGsYVVxuOBeDe4ifjONC', 0);
INSERT INTO login_users (username, password_hash, admin) VALUES ('Charlotte Harris',  '$2b$10$QtpHwEYzwfBvtMldAoxlBOJbo3AEGQKm8xGsYVVxuOBeDe4ifjONC', 0);
INSERT INTO login_users (username, password_hash, admin) VALUES ('Alexander Jackson', '$2b$10$QtpHwEYzwfBvtMldAoxlBOJbo3AEGQKm8xGsYVVxuOBeDe4ifjONC', 0);
INSERT INTO login_users (username, password_hash, admin) VALUES ('Daniel Garcia',     '$2b$10$QtpHwEYzwfBvtMldAoxlBOJbo3AEGQKm8xGsYVVxuOBeDe4ifjONC', 0);
INSERT INTO login_users (username, password_hash, admin) VALUES ('Evelyn Lee',        '$2b$10$QtpHwEYzwfBvtMldAoxlBOJbo3AEGQKm8xGsYVVxuOBeDe4ifjONC', 0);
INSERT INTO login_users (username, password_hash, admin) VALUES ('Jackson Walker',    '$2b$10$QtpHwEYzwfBvtMldAoxlBOJbo3AEGQKm8xGsYVVxuOBeDe4ifjONC', 0);

commit;
