from validation import validate_attendance


def calculate_grade(marks: int) -> str:
    """
    Calculate a letter grade based upon the supplied number grade

    :param int marks:   The grade to convert to a letter grade
    :returns:           The letter grade or "Invalid" 
    """
    if marks is None:
        return "Invalid"

    if not isinstance(marks, (int, float)):
        return "Invalid"

    if marks < 0 or marks > 100:
        return "Invalid"

    if marks >= 90:
        return "A"

    if marks >= 75:
        return "B"

    if marks >= 50:
        return "C"

    return "Fail"


def calculate_result(marks: int, attendance: int) -> str:
    """
    Calculate passing/failing based on the grade and attendance
    
    :param int marks:       The number grade
    :param int attendance:  The attendance
    :returns:               A string based upon the results of the calculation
    """
    if (
        marks is None
        or attendance is None
        ):
        return "Invalid Input"

    grade = calculate_grade(marks)
    status = validate_attendance(attendance)

    # INVALID CASES
    if (
        grade == "Invalid"
        or status == "Invalid"
        or not isinstance(marks, (int, float))
        or not isinstance(attendance, (int, float))
        ):
        return "Invalid Input"

    # FAIL BOTH
    if grade == "Fail" and status == "Not eligible for exam":
        return "Fail (Low Grades and Low Attendance)"

    # FAIL MARKS
    if grade == "Fail":
        return "Fail (Low Grades)"

    # FAIL ATTENDANCE
    if status == "Not eligible for exam":
        return "Fail (Low Attendance)"

    # PASS CASE
    return "Pass"

def calculate_average(numbers: list, return_float: bool) -> float | int | None:
    """
    Calculate the average of a list of numbers.

    :param list numbers:        The numbers to average
    :param bool return_float:   If True, return a float rounded to 1 decimal place;
                                if False, return a rounded integer
    :returns:                   The average, or None if input is invalid or empty
    """
    if not isinstance(numbers, list) or len(numbers) == 0:
        return None

    average = sum(numbers) / len(numbers)
    return round(average, 1) if return_float else round(average)

print(calculate_average([100, 87, 100, 98, 84, 95, 82, 95, 96, 94, 95, 100, 100, 100, 100, 100, 100], True))
