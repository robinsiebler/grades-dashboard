def validate_attendance(attendance: int) -> str:
    """
    Caclulate whether a student is eligble for the exam for a subject based upon attendance.

    :param int attendance:  Percentage of attendance for a subject
    :returns:               The result of the calculation or "Invalid"
    """
    if attendance is None:
        return "Invalid"

    if not isinstance(attendance, (int, float)):
        return "Invalid"

    if attendance < 0 or attendance > 100:
        return "Invalid"

    if attendance >= 75:
        return "Eligible for exam"

    return "Not eligible for exam"
