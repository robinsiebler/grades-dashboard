// Returns "Eligible for exam" if attendance is >= 75, "Not Eligible for exam" if below, or "Invalid" for non-numeric or out-of-range values
function validateAttendance(attendance) {
    if (attendance == null || typeof (attendance) !== "number" || Number.isNaN(attendance) || attendance == undefined) { return "Invalid"; }

    else if (attendance < 0 || attendance > 100) { return "Invalid"; }

    else if (attendance >= 75) { return "Eligible for exam"; }

    else { return "Not Eligible for exam"; }
}

module.exports = { validateAttendance };