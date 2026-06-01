// Returns a letter grade (A, B, C, Fail) for a numeric score 0-100, or "Invalid" for non-numeric or out-of-range values
function calculateGrade(grades) {
    if (grades == null || typeof (grades) !== "number" || Number.isNaN(grades) || grades == undefined) { return "Invalid"; }

    else if (grades < 0 || grades > 100) { return "Invalid"; }

    if (grades >= 90) { return "A"; }

    else if (grades >= 75) { return "B"; }

    else if (grades >= 50) { return "C"; }

    else { return "Fail"; }
}

module.exports = { calculateGrade };