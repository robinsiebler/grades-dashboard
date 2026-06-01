const { validateAttendance } = require('./attendance')

/* =========================
    Invalid Input
   ========================= */

test("Attendance is null", () => {
    expect(validateAttendance(null)).toBe('Invalid');
});

test("Attendance is undefined", () => {
    expect(validateAttendance(undefined)).toBe('Invalid');
});

test("Attendance is a string", () => {
    expect(validateAttendance('a')).toBe('Invalid');
});

test("Attendance is NaN", () => {
    expect(validateAttendance(NaN)).toBe('Invalid');
});

test("Attendance is a numeric string", () => {
    expect(validateAttendance('75')).toBe('Invalid');
});

test("Attendance is a boolean true", () => {
    expect(validateAttendance(true)).toBe('Invalid');
});

test("Attendance is a boolean false", () => {
    expect(validateAttendance(false)).toBe('Invalid');
});

/* =========================
    Out of range
   ========================= */

test("Attendance is < 0", () => {
    expect(validateAttendance(-1)).toBe('Invalid');
});

test("Attendance is > 100", () => {
    expect(validateAttendance(101)).toBe('Invalid');
});

/* =========================
    Not Eligible for exam
   ========================= */

test("Attendance is 0 (lower valid boundary)", () => {
    expect(validateAttendance(0)).toBe('Not Eligible for exam');
});

test("Attendance is 50 (mid-range not eligible)", () => {
    expect(validateAttendance(50)).toBe('Not Eligible for exam');
});

test("Attendance is 74 (one below threshold)", () => {
    expect(validateAttendance(74)).toBe('Not Eligible for exam');
});

test("Attendance is 74.9 (float below threshold)", () => {
    expect(validateAttendance(74.9)).toBe('Not Eligible for exam');
});

/* =========================
    Eligible for exam
   ========================= */

test("Attendance is 75 (exact threshold)", () => {
    expect(validateAttendance(75)).toBe('Eligible for exam');
});

test("Attendance is 76 (one above threshold)", () => {
    expect(validateAttendance(76)).toBe('Eligible for exam');
});

test("Attendance is 90 (mid-range eligible)", () => {
    expect(validateAttendance(90)).toBe('Eligible for exam');
});

test("Attendance is 100 (upper valid boundary)", () => {
    expect(validateAttendance(100)).toBe('Eligible for exam');
});
