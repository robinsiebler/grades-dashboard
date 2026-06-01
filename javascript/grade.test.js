const { calculateGrade } = require('./grade')

/* =========================
    Invalid Input
   ========================= */

test("Grade is null", () => {
    expect(calculateGrade(null)).toBe('Invalid');
});

test("Grade is undefined", () => {
    expect(calculateGrade(undefined)).toBe('Invalid');
});

test("Grade is a string", () => {
    expect(calculateGrade('a')).toBe('Invalid');
});

// FIX: was also passing 'a' (string) — NaN is typeof "number", so it takes a different code path
test("Grade is NaN", () => {
    expect(calculateGrade(NaN)).toBe('Invalid');
});

test("Grade is a numeric string", () => {
    expect(calculateGrade('90')).toBe('Invalid');
});

test("Grade is a boolean true", () => {
    expect(calculateGrade(true)).toBe('Invalid');
});

test("Grade is a boolean false", () => {
    expect(calculateGrade(false)).toBe('Invalid');
});

/* =========================
    Out of range
   ========================= */

test("Grade is < 0", () => {
    expect(calculateGrade(-1)).toBe('Invalid');
});

test("Grade is > 100", () => {
    expect(calculateGrade(101)).toBe('Invalid');
});

/* =========================
    Fail
   ========================= */

test("Grade is 0 (lower valid boundary)", () => {
    expect(calculateGrade(0)).toBe('Fail');
});

test("Grade is 25 (mid-range fail)", () => {
    expect(calculateGrade(25)).toBe('Fail');
});

test("Grade is 49 (one below C threshold)", () => {
    expect(calculateGrade(49)).toBe('Fail');
});

test("Grade is 49.9 (float below C threshold)", () => {
    expect(calculateGrade(49.9)).toBe('Fail');
});

/* =========================
    C
   ========================= */

test("Grade is 50 (exact C threshold)", () => {
    expect(calculateGrade(50)).toBe('C');
});

test("Grade is 62 (mid-range C)", () => {
    expect(calculateGrade(62)).toBe('C');
});

test("Grade is 74 (one below B threshold)", () => {
    expect(calculateGrade(74)).toBe('C');
});

test("Grade is 74.9 (float below B threshold)", () => {
    expect(calculateGrade(74.9)).toBe('C');
});

/* =========================
    B
   ========================= */

test("Grade is 75 (exact B threshold)", () => {
    expect(calculateGrade(75)).toBe('B');
});

test("Grade is 82 (mid-range B)", () => {
    expect(calculateGrade(82)).toBe('B');
});

test("Grade is 89 (one below A threshold)", () => {
    expect(calculateGrade(89)).toBe('B');
});

test("Grade is 89.9 (float below A threshold)", () => {
    expect(calculateGrade(89.9)).toBe('B');
});

/* =========================
    A
   ========================= */

test("Grade is 90 (exact A threshold)", () => {
    expect(calculateGrade(90)).toBe('A');
});

test("Grade is 95 (mid-range A)", () => {
    expect(calculateGrade(95)).toBe('A');
});

test("Grade is 100 (upper valid boundary)", () => {
    expect(calculateGrade(100)).toBe('A');
});
