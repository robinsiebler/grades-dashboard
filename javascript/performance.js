const { calculateGrade } = require('./grade.js');
const { validateAttendance } = require('./attendance.js');

// Returns a pass/fail result string based on grade and attendance; returns "Invalid Input" if either value is invalid
function calculatePerformance(grades, attendance) {
    let grade = calculateGrade(grades);
    let attendanceStatus = validateAttendance(attendance);


    // INVALID CASES
    if (grade === "Invalid" || attendanceStatus === "Invalid" || grade === " " || attendanceStatus === " ") {
        return "Invalid Input";
    }

    // FAIL CASE (GRADES)
    if (grade === "Fail" && attendanceStatus === "Eligible for exam") {
        return "Fail (Low Grades)";
    }

    // FAIL CASE (ATTENDANCE)
    if (attendanceStatus === "Not Eligible for exam" && grade !== "Fail") {
        return "Fail (Low Attendance)";
    }

    // FAIL CASE (GRADE + ATTENDANCE)
    if (grade === "Fail" && attendanceStatus === "Not Eligible for exam") {
        return "Fail (Low Grades and Low Attendance)";
    }

    // PASS CASE
    return "Pass";
}

// Returns the average of a numeric array; returns a float (1 decimal place) if returnFloat is true, otherwise a rounded integer
function calculateAverage(numbers, returnFloat) {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return null;
  }

  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const average = sum / numbers.length;

  return returnFloat ? parseFloat(average.toFixed(1)) : Math.round(average);
}

module.exports = { calculatePerformance, calculateGrade, validateAttendance, calculateAverage };
