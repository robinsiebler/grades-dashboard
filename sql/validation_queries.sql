-- VALIDATION QUERIES
-- Used to verify:
--   * inserted data is present
--   * NULL values are absent
--   * values are within valid ranges
--   * domain values are in the allowed set
--   * duplicates are absent
--   * referential integrity holds
--   * business rules are followed

-- ============================================================
-- STUDENTS TABLE
-- ============================================================

-- List all students
SELECT * FROM STUDENTS ORDER BY NAME;

-- Total student count
SELECT COUNT(*) AS TOTAL_STUDENTS FROM STUDENTS;

-- ---- NULL checks ----

-- Any student missing a name, GPA, or overall attendance?
-- Expect: 0 rows
SELECT * FROM STUDENTS
WHERE NAME IS NULL
   OR GPA IS NULL
   OR OVERALL_ATTENDANCE IS NULL;

-- ---- Range checks ----

-- Any student with a GPA outside 0-100?
-- Expect: 0 rows
SELECT * FROM STUDENTS
WHERE GPA < 0 OR GPA > 100;

-- Any student with overall attendance outside 0-100?
-- Expect: 0 rows
SELECT * FROM STUDENTS
WHERE OVERALL_ATTENDANCE < 0 OR OVERALL_ATTENDANCE > 100;

-- ---- Duplicate check ----

-- Any duplicate student names?
-- Expect: 0 rows
SELECT NAME, COUNT(*) AS DUPLICATE_COUNT
FROM STUDENTS
GROUP BY NAME
HAVING COUNT(*) > 1;

-- ---- Data checks ----

-- Students with low overall attendance (below the 75% threshold)
SELECT NAME, OVERALL_ATTENDANCE
FROM STUDENTS
WHERE OVERALL_ATTENDANCE < 75
ORDER BY OVERALL_ATTENDANCE;

-- GPA toppers (overall average of 90 or above)
SELECT NAME, GPA
FROM STUDENTS
WHERE GPA >= 90
ORDER BY GPA DESC;

-- ============================================================
-- SUBJECTS TABLE
-- ============================================================

-- List all subjects with their student names
SELECT ST.NAME, SUB.SUBJECT, SUB.GRADES, SUB.GRADE, SUB.ATTENDANCE, SUB.RESULT
FROM SUBJECTS SUB
JOIN STUDENTS ST ON ST.ID = SUB.STUDENT_ID
ORDER BY ST.NAME, SUB.SUBJECT;

-- Total subject record count
SELECT COUNT(*) AS TOTAL_SUBJECTS FROM SUBJECTS;

-- ---- NULL checks ----

-- Any subject record with a NULL in a required column?
-- Expect: 0 rows
SELECT * FROM SUBJECTS
WHERE STUDENT_ID IS NULL
   OR SUBJECT IS NULL
   OR GRADES IS NULL
   OR GRADE IS NULL
   OR ATTENDANCE IS NULL
   OR RESULT IS NULL;

-- ---- Range checks ----

-- Any subject with GRADES outside 0-100?
-- Expect: 0 rows
SELECT * FROM SUBJECTS
WHERE GRADES < 0 OR GRADES > 100;

-- Any subject with ATTENDANCE outside 0-100?
-- Expect: 0 rows
SELECT * FROM SUBJECTS
WHERE ATTENDANCE < 0 OR ATTENDANCE > 100;

-- ---- Domain checks ----

-- Any GRADE value outside the allowed set (A, B, C, Fail)?
-- Expect: 0 rows
SELECT * FROM SUBJECTS
WHERE GRADE NOT IN ('A', 'B', 'C', 'Fail');

-- Any RESULT value outside the allowed set?
-- Expect: 0 rows
SELECT * FROM SUBJECTS
WHERE RESULT NOT IN (
    'Pass',
    'Fail (Low Grades)',
    'Fail (Low Attendance)',
    'Fail (Low Grades and Low Attendance)'
);

-- ---- Result breakdowns ----

-- All passing subject records
SELECT ST.NAME, SUB.SUBJECT, SUB.GRADES, SUB.ATTENDANCE
FROM SUBJECTS SUB
JOIN STUDENTS ST ON ST.ID = SUB.STUDENT_ID
WHERE SUB.RESULT = 'Pass'
ORDER BY ST.NAME;

-- All failing subject records (any fail reason)
SELECT ST.NAME, SUB.SUBJECT, SUB.GRADES, SUB.ATTENDANCE, SUB.RESULT
FROM SUBJECTS SUB
JOIN STUDENTS ST ON ST.ID = SUB.STUDENT_ID
WHERE SUB.RESULT LIKE 'Fail%'
ORDER BY ST.NAME;

-- Fail due to low grades only
SELECT ST.NAME, SUB.SUBJECT, SUB.GRADES, SUB.ATTENDANCE
FROM SUBJECTS SUB
JOIN STUDENTS ST ON ST.ID = SUB.STUDENT_ID
WHERE SUB.RESULT = 'Fail (Low Grades)'
ORDER BY ST.NAME;

-- Fail due to low attendance only
SELECT ST.NAME, SUB.SUBJECT, SUB.GRADES, SUB.ATTENDANCE
FROM SUBJECTS SUB
JOIN STUDENTS ST ON ST.ID = SUB.STUDENT_ID
WHERE SUB.RESULT = 'Fail (Low Attendance)'
ORDER BY ST.NAME;

-- Fail due to both low grades and low attendance
SELECT ST.NAME, SUB.SUBJECT, SUB.GRADES, SUB.ATTENDANCE
FROM SUBJECTS SUB
JOIN STUDENTS ST ON ST.ID = SUB.STUDENT_ID
WHERE SUB.RESULT = 'Fail (Low Grades and Low Attendance)'
ORDER BY ST.NAME;

-- ---- Grade-level checks ----

-- All Grade A subject records
SELECT ST.NAME, SUB.SUBJECT, SUB.GRADES
FROM SUBJECTS SUB
JOIN STUDENTS ST ON ST.ID = SUB.STUDENT_ID
WHERE SUB.GRADE = 'A'
ORDER BY SUB.GRADES DESC;

-- Subject toppers (GRADES >= 90)
SELECT ST.NAME, SUB.SUBJECT, SUB.GRADES
FROM SUBJECTS SUB
JOIN STUDENTS ST ON ST.ID = SUB.STUDENT_ID
WHERE SUB.GRADES >= 90
ORDER BY SUB.GRADES DESC;

-- ---- Duplicate check ----

-- Any student with the same subject recorded more than once?
-- Expect: 0 rows
SELECT STUDENT_ID, SUBJECT, COUNT(*) AS DUPLICATE_COUNT
FROM SUBJECTS
GROUP BY STUDENT_ID, SUBJECT
HAVING COUNT(*) > 1;

-- ============================================================
-- REFERENTIAL INTEGRITY
-- ============================================================

-- Any subject row whose STUDENT_ID does not exist in STUDENTS?
-- Expect: 0 rows
SELECT * FROM SUBJECTS SUB
WHERE NOT EXISTS (
    SELECT 1 FROM STUDENTS ST WHERE ST.ID = SUB.STUDENT_ID
);

-- ============================================================
-- BUSINESS RULE CONSISTENCY
-- ============================================================

-- Pass results where grades or attendance do not meet the threshold
-- Expect: 0 rows
SELECT * FROM SUBJECTS
WHERE RESULT = 'Pass'
  AND (GRADES < 50 OR ATTENDANCE < 75);

-- Fail (Low Grades) results where grades are actually passing or attendance is low
-- Expect: 0 rows
SELECT * FROM SUBJECTS
WHERE RESULT = 'Fail (Low Grades)'
  AND (GRADES >= 50 OR ATTENDANCE < 75);

-- Fail (Low Attendance) results where attendance is actually passing or grades are low
-- Expect: 0 rows
SELECT * FROM SUBJECTS
WHERE RESULT = 'Fail (Low Attendance)'
  AND (GRADES < 50 OR ATTENDANCE >= 75);

-- Fail (Low Grades and Low Attendance) results where either value is actually passing
-- Expect: 0 rows
SELECT * FROM SUBJECTS
WHERE RESULT = 'Fail (Low Grades and Low Attendance)'
  AND (GRADES >= 50 OR ATTENDANCE >= 75);

-- GRADE letter does not match the GRADES score
-- Expect: 0 rows
SELECT * FROM SUBJECTS
WHERE (GRADES >= 90 AND GRADE != 'A')
   OR (GRADES >= 75 AND GRADES < 90 AND GRADE != 'B')
   OR (GRADES >= 50 AND GRADES < 75 AND GRADE != 'C')
   OR (GRADES < 50  AND GRADE != 'Fail');

-- Fail results that somehow have Grade A (impossible by business rules)
-- Expect: 0 rows
SELECT * FROM SUBJECTS
WHERE RESULT LIKE 'Fail%' AND GRADE = 'A';

-- ============================================================
-- LOGIN_USERS TABLE
-- ============================================================

-- List all login users (passwords excluded)
SELECT USERNAME, ADMIN FROM LOGIN_USERS ORDER BY USERNAME;

-- Total login user count
SELECT COUNT(*) AS TOTAL_USERS FROM LOGIN_USERS;

-- Any user missing a username or password hash?
-- Expect: 0 rows
SELECT * FROM LOGIN_USERS
WHERE USERNAME IS NULL
   OR PASSWORD_HASH IS NULL;

-- Any ADMIN flag outside the allowed values (0 or 1)?
-- Expect: 0 rows
SELECT * FROM LOGIN_USERS
WHERE ADMIN NOT IN (0, 1);

-- ============================================================
-- SUMMARY VIEWS
-- ============================================================

-- Per-student pass/fail counts across all subjects
SELECT
    ST.NAME,
    COUNT(*) AS TOTAL_SUBJECTS,
    SUM(CASE WHEN SUB.RESULT = 'Pass' THEN 1 ELSE 0 END) AS PASSED,
    SUM(CASE WHEN SUB.RESULT LIKE 'Fail%' THEN 1 ELSE 0 END) AS FAILED,
    ST.GPA,
    ST.OVERALL_ATTENDANCE
FROM STUDENTS ST
JOIN SUBJECTS SUB ON ST.ID = SUB.STUDENT_ID
GROUP BY ST.NAME, ST.GPA, ST.OVERALL_ATTENDANCE
ORDER BY ST.NAME;

-- Overall pass/fail counts across all subject records
SELECT
    COUNT(*) AS TOTAL,
    SUM(CASE WHEN RESULT = 'Pass' THEN 1 ELSE 0 END) AS TOTAL_PASS,
    SUM(CASE WHEN RESULT LIKE 'Fail%' THEN 1 ELSE 0 END) AS TOTAL_FAIL,
    ROUND(SUM(CASE WHEN RESULT = 'Pass' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS PASS_RATE_PCT
FROM SUBJECTS;
