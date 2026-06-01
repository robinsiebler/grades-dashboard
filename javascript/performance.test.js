const { calculatePerformance, calculateAverage } = require('./performance')

/* =========================
    Invalid Input
   ========================= */

test("Grade is Invalid (null)", () => {
    expect(calculatePerformance(null, 76)).toBe('Invalid Input');
});

test("Grade is Invalid (undefined)", () => {
    expect(calculatePerformance(undefined, 76)).toBe('Invalid Input');
});

test("Grade is Invalid (string)", () => {
    expect(calculatePerformance(' ', 76)).toBe('Invalid Input');
});

test("Grade is Invalid (NaN)", () => {
    expect(calculatePerformance(NaN, 76)).toBe('Invalid Input');
});

test("Grade is Invalid (out of range)", () => {
    expect(calculatePerformance(-1, 76)).toBe('Invalid Input');
});

test("Attendance is Invalid (null)", () => {
    expect(calculatePerformance(76, null)).toBe('Invalid Input');
});

test("Attendance is Invalid (undefined)", () => {
    expect(calculatePerformance(76, undefined)).toBe('Invalid Input');
});

test("Attendance is Invalid (string)", () => {
    expect(calculatePerformance(76, ' ')).toBe('Invalid Input');
});

test("Attendance is Invalid (NaN)", () => {
    expect(calculatePerformance(76, NaN)).toBe('Invalid Input');
});

test("Attendance is Invalid (out of range)", () => {
    expect(calculatePerformance(76, 101)).toBe('Invalid Input');
});

test("Both grade and attendance are invalid", () => {
    expect(calculatePerformance(null, null)).toBe('Invalid Input');
});

/* =========================
    Fail (Low Grades)
   ========================= */

test("Fail due to low grade, attendance exactly at threshold", () => {
    expect(calculatePerformance(49, 75)).toBe('Fail (Low Grades)');
});

test("Fail due to low grade, attendance well above threshold", () => {
    expect(calculatePerformance(49, 90)).toBe('Fail (Low Grades)');
});

/* =========================
    Fail (Low Attendance)
   ========================= */

test("Fail due to low attendance, B grade", () => {
    expect(calculatePerformance(75, 45)).toBe('Fail (Low Attendance)');
});

test("Fail due to low attendance, C grade", () => {
    expect(calculatePerformance(50, 74)).toBe('Fail (Low Attendance)');
});

/* =========================
    Fail (Low Grades and Low Attendance)
   ========================= */

test("Fail due to low grade and low attendance", () => {
    expect(calculatePerformance(45, 45)).toBe('Fail (Low Grades and Low Attendance)');
});

test("Fail due to low grade and low attendance, both at minimum", () => {
    expect(calculatePerformance(0, 0)).toBe('Fail (Low Grades and Low Attendance)');
});

/* =========================
    Pass
   ========================= */

test("Pass with B grade, attendance exactly at threshold", () => {
    expect(calculatePerformance(75, 75)).toBe('Pass');
});

test("Pass with A grade", () => {
    expect(calculatePerformance(90, 80)).toBe('Pass');
});

test("Pass with C grade, attendance exactly at threshold", () => {
    expect(calculatePerformance(50, 75)).toBe('Pass');
});

/* =========================
    calculateAverage — invalid input
   ========================= */

test("calculateAverage returns null for null", () => {
    expect(calculateAverage(null, true)).toBeNull();
});

test("calculateAverage returns null for undefined", () => {
    expect(calculateAverage(undefined, false)).toBeNull();
});

test("calculateAverage returns null for a number", () => {
    expect(calculateAverage(85, true)).toBeNull();
});

test("calculateAverage returns null for a string", () => {
    expect(calculateAverage('85', false)).toBeNull();
});

test("calculateAverage returns null for an empty array", () => {
    expect(calculateAverage([], true)).toBeNull();
});

/* =========================
    calculateAverage — returnFloat: true
   ========================= */

test("calculateAverage returns a float for a single-element array", () => {
    expect(calculateAverage([85], true)).toBe(85.0);
});

test("calculateAverage returns a float for a clean average", () => {
    expect(calculateAverage([80, 90], true)).toBe(85.0);
});

test("calculateAverage returns a float rounded to 1 decimal place", () => {
    expect(calculateAverage([75, 80], true)).toBe(77.5);
});

test("calculateAverage float rounds correctly at the half-point", () => {
    expect(calculateAverage([70, 71], true)).toBe(70.5);
});

test("calculateAverage float works across three elements", () => {
    expect(calculateAverage([70, 80, 90], true)).toBe(80.0);
});

/* =========================
    calculateAverage — returnFloat: false
   ========================= */

test("calculateAverage returns an integer for a single-element array", () => {
    expect(calculateAverage([85], false)).toBe(85);
});

test("calculateAverage returns an integer for a clean average", () => {
    expect(calculateAverage([80, 90], false)).toBe(85);
});

test("calculateAverage integer rounds up at 0.5", () => {
    expect(calculateAverage([74, 75], false)).toBe(75);  // 74.5 → 75
});

test("calculateAverage integer rounds down below 0.5", () => {
    expect(calculateAverage([74, 74], false)).toBe(74);  // 74 → 74
});

test("calculateAverage integer works across three elements", () => {
    expect(calculateAverage([60, 70, 80], false)).toBe(70);
});
