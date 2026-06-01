from result import calculate_grade, calculate_result, calculate_average
from validation import validate_attendance

# -------------------------
# GRADE TESTS
# -------------------------

# -----------------
#   Invalid Input
# -----------------

def test_grade_none():
    assert calculate_grade(None) == 'Invalid'

def test_grade_not_number():
    assert calculate_grade('Foo') == 'Invalid'

# bool is a subclass of int in Python so isinstance(True, int) is True;
# these tests document that behaviour explicitly
def test_grade_bool_true():
    assert calculate_grade(True) == 'Fail'

def test_grade_bool_false():
    assert calculate_grade(False) == 'Fail'

# -----------------
#   Out of range
# -----------------

def test_grade_negative():
    assert calculate_grade(-1) == 'Invalid'

def test_grade_above_100():
    assert calculate_grade(101) == 'Invalid'

# -----------------
#   Fail
# -----------------

# FIX: was named grade_under_50 (no test_ prefix) so pytest never discovered it
def test_grade_under_50():
    assert calculate_grade(49) == 'Fail'

def test_grade_zero():
    assert calculate_grade(0) == 'Fail'

def test_grade_25():
    assert calculate_grade(25) == 'Fail'

def test_grade_49_9():
    assert calculate_grade(49.9) == 'Fail'

# -----------------
#   C
# -----------------

def test_grade_c_threshold():
    assert calculate_grade(50) == 'C'

def test_grade_c_mid():
    assert calculate_grade(62) == 'C'

def test_grade_c_upper():
    assert calculate_grade(74) == 'C'

def test_grade_c_float():
    assert calculate_grade(74.9) == 'C'

# -----------------
#   B
# -----------------

def test_grade_b_threshold():
    assert calculate_grade(75) == 'B'

def test_grade_b_mid():
    assert calculate_grade(82) == 'B'

def test_grade_b_upper():
    assert calculate_grade(89) == 'B'

def test_grade_b_float():
    assert calculate_grade(89.9) == 'B'

# -----------------
#   A
# -----------------

def test_grade_a_threshold():
    assert calculate_grade(90) == 'A'

def test_grade_a_mid():
    assert calculate_grade(95) == 'A'

def test_grade_a_max():
    assert calculate_grade(100) == 'A'

# -------------------------
# ATTENDANCE TESTS
# -------------------------

# -----------------
#   Invalid Input
# -----------------

def test_attendance_none():
    assert validate_attendance(None) == 'Invalid'

def test_attendance_not_number():
    assert validate_attendance('Foo') == 'Invalid'

# -----------------
#   Out of range
# -----------------

def test_attendance_negative():
    assert validate_attendance(-1) == 'Invalid'

def test_attendance_above_100():
    assert validate_attendance(101) == 'Invalid'

# -----------------
#   Not eligible for exam
# -----------------

def test_attendance_zero():
    assert validate_attendance(0) == 'Not eligible for exam'

def test_attendance_mid_low():
    assert validate_attendance(50) == 'Not eligible for exam'

def test_attendance_low():
    assert validate_attendance(74) == 'Not eligible for exam'

def test_attendance_float_low():
    assert validate_attendance(74.9) == 'Not eligible for exam'

# -----------------
#   Eligible for exam
# -----------------

def test_attendance_requirement_met():
    assert validate_attendance(75) == 'Eligible for exam'

def test_attendance_above_threshold():
    assert validate_attendance(76) == 'Eligible for exam'

def test_attendance_mid_high():
    assert validate_attendance(90) == 'Eligible for exam'

def test_attendance_max():
    assert validate_attendance(100) == 'Eligible for exam'

# -------------------------
# PERFORMANCE TESTS
# -------------------------

# -----------------
#   Invalid Input
# -----------------

def test_perf_grade_none():
    assert calculate_result(None, 75) == 'Invalid Input'

def test_perf_grade_not_number():
    assert calculate_result('Foo', 75) == 'Invalid Input'

def test_perf_grade_invalid_negative():
    assert calculate_result(-1, 75) == 'Invalid Input'

def test_perf_grade_invalid_high():
    assert calculate_result(101, 75) == 'Invalid Input'

def test_perf_attendance_none():
    assert calculate_result(75, None) == 'Invalid Input'

def test_perf_attendance_not_number():
    assert calculate_result(75, 'Foo') == 'Invalid Input'

def test_perf_attendance_invalid_negative():
    assert calculate_result(75, -1) == 'Invalid Input'

def test_perf_attendance_invalid_high():
    assert calculate_result(75, 101) == 'Invalid Input'

def test_perf_both_invalid():
    assert calculate_result(None, None) == 'Invalid Input'

# -----------------
#   Fail (Low Grades and Low Attendance)
# -----------------

def test_perf_fail_both():
    assert calculate_result(49, 74) == 'Fail (Low Grades and Low Attendance)'

def test_perf_fail_both_minimum():
    assert calculate_result(0, 0) == 'Fail (Low Grades and Low Attendance)'

# -----------------
#   Fail (Low Grades)
# -----------------

def test_perf_fail_grades():
    assert calculate_result(49, 75) == 'Fail (Low Grades)'

def test_perf_fail_grades_high_attendance():
    assert calculate_result(49, 90) == 'Fail (Low Grades)'

# -----------------
#   Fail (Low Attendance)
# -----------------

def test_perf_fail_attendance():
    assert calculate_result(75, 74) == 'Fail (Low Attendance)'

def test_perf_fail_attendance_c_grade():
    assert calculate_result(50, 74) == 'Fail (Low Attendance)'

# -----------------
#   Pass
# -----------------

# FIX: was asserting 'Pass - Grade: B' but calculate_result returns 'Pass'
def test_perf_pass_b():
    assert calculate_result(75, 75) == 'Pass'

def test_perf_pass_a():
    assert calculate_result(90, 80) == 'Pass'

def test_perf_pass_c():
    assert calculate_result(50, 75) == 'Pass'

# -------------------------
# CALCULATE AVERAGE TESTS
# -------------------------

# -----------------
#   Invalid Input
# -----------------

def test_average_none():
    assert calculate_average(None, True) is None

def test_average_not_a_list():
    assert calculate_average(85, False) is None

def test_average_empty_list():
    assert calculate_average([], True) is None

# -----------------
#   return_float=True
# -----------------

def test_average_float_single_element():
    assert calculate_average([85], True) == 85.0

def test_average_float_clean():
    assert calculate_average([80, 90], True) == 85.0

def test_average_float_one_decimal():
    assert calculate_average([75, 80], True) == 77.5

def test_average_float_three_elements():
    assert calculate_average([70, 80, 90], True) == 80.0

# -----------------
#   return_float=False
# -----------------

def test_average_int_single_element():
    assert calculate_average([85], False) == 85

def test_average_int_clean():
    assert calculate_average([80, 90], False) == 85

def test_average_int_three_elements():
    assert calculate_average([60, 70, 80], False) == 70
