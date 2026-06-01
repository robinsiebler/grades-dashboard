const request = require('supertest');

// Mock oracledb (native module) before server.js is required
jest.mock('oracledb', () => ({
    OUT_FORMAT_OBJECT: 'OUT_FORMAT_OBJECT',
    BIND_OUT: 'BIND_OUT',
    NUMBER: 'NUMBER',
}));

jest.mock('./db');
jest.mock('bcrypt');

const getConnection = require('./db');
const bcrypt = require('bcrypt');
const app = require('./server');

// Shared mock connection — all methods are reset in beforeEach
const mockConn = {
    execute: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    close: jest.fn(),
};

beforeEach(() => {
    jest.resetAllMocks();
    getConnection.mockResolvedValue(mockConn);
    mockConn.commit.mockResolvedValue(undefined);
    mockConn.rollback.mockResolvedValue(undefined);
    mockConn.close.mockResolvedValue(undefined);
    bcrypt.hash.mockResolvedValue('$2b$10$mockhashedpassword');
    bcrypt.compare.mockResolvedValue(true);
});

// ---------------------------------------------------------------------------
// POST /login
// ---------------------------------------------------------------------------
describe('POST /login', () => {
    test('400 when credentials are missing', async () => {
        const res = await request(app).post('/login').send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/username and password/i);
    });

    test('401 when user does not exist', async () => {
        mockConn.execute.mockResolvedValueOnce({ rows: [] });
        const res = await request(app).post('/login').send({ username: 'unknown', password: 'pw123' });
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toMatch(/invalid credentials/i);
    });

    test('401 when password is wrong', async () => {
        mockConn.execute.mockResolvedValueOnce({ rows: [{ PASSWORD_HASH: '$2b$10$hash', ADMIN: 0 }] });
        bcrypt.compare.mockResolvedValueOnce(false);
        const res = await request(app).post('/login').send({ username: 'user1', password: 'wrongpw' });
        expect(res.statusCode).toBe(401);
    });

    test('200 with success and isAdmin false on valid login', async () => {
        mockConn.execute.mockResolvedValueOnce({ rows: [{ PASSWORD_HASH: '$2b$10$hash', ADMIN: 0 }] });
        const res = await request(app).post('/login').send({ username: 'user1', password: 'password123' });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.isAdmin).toBe(false);
    });

    test('200 with isAdmin true for admin user', async () => {
        mockConn.execute.mockResolvedValueOnce({ rows: [{ PASSWORD_HASH: '$2b$10$hash', ADMIN: 1 }] });
        const res = await request(app).post('/login').send({ username: 'admin', password: 'adminpw' });
        expect(res.statusCode).toBe(200);
        expect(res.body.isAdmin).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// POST /register
// ---------------------------------------------------------------------------
describe('POST /register', () => {
    test('400 when credentials are missing', async () => {
        const res = await request(app).post('/register').send({});
        expect(res.statusCode).toBe(400);
    });

    test('400 when password is too short', async () => {
        const res = await request(app).post('/register').send({ username: 'user1', password: 'abc' });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/6 characters/);
    });

    test('409 when username already exists', async () => {
        mockConn.execute.mockResolvedValueOnce({ rows: [{ USERNAME: 'existinguser' }] });
        const res = await request(app).post('/register').send({ username: 'existinguser', password: 'password123' });
        expect(res.statusCode).toBe(409);
    });

    test('200 with success on valid registration', async () => {
        mockConn.execute
            .mockResolvedValueOnce({ rows: [] })          // check: user not found
            .mockResolvedValueOnce({ rowsAffected: 1 });  // insert
        const res = await request(app).post('/register').send({ username: 'newuser', password: 'password123' });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.isAdmin).toBe(false);
    });

    test('registers admin user with isAdmin: true', async () => {
        mockConn.execute
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rowsAffected: 1 });
        const res = await request(app).post('/register').send({ username: 'adminuser', password: 'password123', isAdmin: true });
        expect(res.statusCode).toBe(200);
        expect(res.body.isAdmin).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// POST /student
// ---------------------------------------------------------------------------
describe('POST /student', () => {
    test('400 when subject field is missing', async () => {
        const res = await request(app).post('/student').send({ name: 'Alice', grades: 85, attendance: 80 });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/subject/i);
    });

    test('400 for out-of-range grades or attendance', async () => {
        // Validation runs before getConnection, so no DB mock needed
        const res = await request(app).post('/student').send({ name: 'Alice', subject: 'Math', grades: -5, attendance: 200 });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/invalid/i);
    });

    test('200 creates new student and inserts subject', async () => {
        mockConn.execute
            .mockResolvedValueOnce({ rows: [] })                      // SELECT student -> not found
            .mockResolvedValueOnce({ outBinds: { id: [1] } })         // INSERT student RETURNING id
            .mockResolvedValueOnce({ rowsAffected: 1 });              // INSERT subject
        const res = await request(app).post('/student').send({ name: 'Alice', subject: 'Math', grades: 85, attendance: 80 });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Student subject added successfully');
        expect(res.body.result).toBe('Pass');
    });

    test('200 adds subject for existing student and updates GPA', async () => {
        mockConn.execute
            .mockResolvedValueOnce({ rows: [{ ID: 1 }] })                           // SELECT student -> found
            .mockResolvedValueOnce({ rows: [] })                                     // SELECT subject -> not duplicate
            .mockResolvedValueOnce({ rows: [{ GRADES: 80, ATTENDANCE: 75 }] })       // SELECT existing subjects
            .mockResolvedValueOnce({ rowsAffected: 1 })                              // UPDATE student GPA
            .mockResolvedValueOnce({ rowsAffected: 1 });                             // INSERT subject
        const res = await request(app).post('/student').send({ name: 'Alice', subject: 'Science', grades: 90, attendance: 85 });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Student subject added successfully');
    });

    test('409 when subject already exists for student', async () => {
        mockConn.execute
            .mockResolvedValueOnce({ rows: [{ ID: 1 }] })   // SELECT student -> found
            .mockResolvedValueOnce({ rows: [{ ID: 5 }] });  // SELECT subject -> duplicate
        const res = await request(app).post('/student').send({ name: 'Alice', subject: 'Math', grades: 85, attendance: 80 });
        expect(res.statusCode).toBe(409);
        expect(res.body.message).toMatch(/already recorded/);
    });

    test('result is Fail (Low Grades) when grade < 50 and attendance >= 75', async () => {
        mockConn.execute
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ outBinds: { id: [2] } })
            .mockResolvedValueOnce({ rowsAffected: 1 });
        const res = await request(app).post('/student').send({ name: 'Bob', subject: 'Math', grades: 30, attendance: 80 });
        expect(res.statusCode).toBe(200);
        expect(res.body.result).toBe('Fail (Low Grades)');
    });

    test('result is Fail (Low Attendance) when grade >= 50 and attendance < 75', async () => {
        mockConn.execute
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ outBinds: { id: [3] } })
            .mockResolvedValueOnce({ rowsAffected: 1 });
        const res = await request(app).post('/student').send({ name: 'Carol', subject: 'Math', grades: 80, attendance: 50 });
        expect(res.statusCode).toBe(200);
        expect(res.body.result).toBe('Fail (Low Attendance)');
    });
});

// ---------------------------------------------------------------------------
// GET /students
// ---------------------------------------------------------------------------
describe('GET /students', () => {
    test('200 returns list of all students', async () => {
        mockConn.execute.mockResolvedValueOnce({
            rows: [
                { ID: 1, NAME: 'Alice', GPA: 88.5, OVERALL_ATTENDANCE: 82 },
                { ID: 2, NAME: 'Bob',   GPA: 72.0, OVERALL_ATTENDANCE: 65 },
            ]
        });
        const res = await request(app).get('/students');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0].NAME).toBe('Alice');
    });

    test('200 returns empty array when no students exist', async () => {
        mockConn.execute.mockResolvedValueOnce({ rows: [] });
        const res = await request(app).get('/students');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// GET /toppers
// ---------------------------------------------------------------------------
describe('GET /toppers', () => {
    test('200 returns gpaToppers and subjectToppers', async () => {
        mockConn.execute
            .mockResolvedValueOnce({ rows: [{ NAME: 'Alice', GPA: 95 }] })
            .mockResolvedValueOnce({ rows: [{ NAME: 'Alice', SUBJECT: 'Math', GRADES: 95 }] });
        const res = await request(app).get('/toppers');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('gpaToppers');
        expect(res.body).toHaveProperty('subjectToppers');
        expect(res.body.gpaToppers[0].NAME).toBe('Alice');
        expect(res.body.subjectToppers[0].SUBJECT).toBe('Math');
    });

    test('200 returns empty arrays when no toppers', async () => {
        mockConn.execute
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });
        const res = await request(app).get('/toppers');
        expect(res.statusCode).toBe(200);
        expect(res.body.gpaToppers).toEqual([]);
        expect(res.body.subjectToppers).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// GET /analytics
// ---------------------------------------------------------------------------
describe('GET /analytics', () => {
    test('200 returns complete analytics object with calculated rates', async () => {
        mockConn.execute
            .mockResolvedValueOnce({ rows: [{ TOTAL: 10, TOTAL_PASS: 8, TOTAL_FAIL: 2 }] })
            .mockResolvedValueOnce({ rows: [{ FAIL_LOW_GRADES: 1, FAIL_LOW_ATTENDANCE: 1, FAIL_BOTH: 0 }] })
            .mockResolvedValueOnce({ rows: [{ SUBJECT: 'Math', TOTAL: 5, PASS_COUNT: 4 }] })
            .mockResolvedValueOnce({ rows: [{ NAME: 'Alice', TOTAL: 3, PASS_COUNT: 3 }] });
        const res = await request(app).get('/analytics');
        expect(res.statusCode).toBe(200);
        expect(res.body.overall).toEqual({ total: 10, passed: 8, failed: 2, pass_rate: 80.0 });
        expect(res.body.by_subject[0]).toMatchObject({ subject: 'Math', total: 5, passed: 4, failed: 1, pass_rate: 80.0 });
        expect(res.body.by_student[0]).toMatchObject({ name: 'Alice', total: 3, passed: 3, failed: 0, pass_rate: 100.0 });
    });

    test('200 returns pass_rate 0 when there are no subjects (no divide-by-zero)', async () => {
        mockConn.execute
            .mockResolvedValueOnce({ rows: [{ TOTAL: 0, TOTAL_PASS: 0, TOTAL_FAIL: 0 }] })
            .mockResolvedValueOnce({ rows: [{ FAIL_LOW_GRADES: 0, FAIL_LOW_ATTENDANCE: 0, FAIL_BOTH: 0 }] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });
        const res = await request(app).get('/analytics');
        expect(res.statusCode).toBe(200);
        expect(res.body.overall.pass_rate).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// GET /low-attendance
// ---------------------------------------------------------------------------
describe('GET /low-attendance', () => {
    test('200 returns students with attendance below 75', async () => {
        mockConn.execute.mockResolvedValueOnce({
            rows: [
                { NAME: 'Bob',     OVERALL_ATTENDANCE: 60 },
                { NAME: 'Charlie', OVERALL_ATTENDANCE: 50 },
            ]
        });
        const res = await request(app).get('/low-attendance');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0].NAME).toBe('Bob');
    });

    test('200 returns empty array when all students meet attendance threshold', async () => {
        mockConn.execute.mockResolvedValueOnce({ rows: [] });
        const res = await request(app).get('/low-attendance');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// GET /search
// ---------------------------------------------------------------------------
describe('GET /search', () => {
    test('400 when name query param is missing', async () => {
        const res = await request(app).get('/search');
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/required/i);
    });

    test('200 returns students matching partial name', async () => {
        mockConn.execute.mockResolvedValueOnce({
            rows: [{ ID: 1, NAME: 'Alice', GPA: 88.5, OVERALL_ATTENDANCE: 82 }]
        });
        const res = await request(app).get('/search?name=Alice');
        expect(res.statusCode).toBe(200);
        expect(res.body[0].NAME).toBe('Alice');
    });

    test('200 returns empty array when no students match', async () => {
        mockConn.execute.mockResolvedValueOnce({ rows: [] });
        const res = await request(app).get('/search?name=Nonexistent');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// GET /student/:id
// ---------------------------------------------------------------------------
describe('GET /student/:id', () => {
    test('400 for non-numeric ID', async () => {
        const res = await request(app).get('/student/abc');
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/invalid student id/i);
    });

    test('404 when student not found', async () => {
        mockConn.execute.mockResolvedValueOnce({ rows: [] });
        const res = await request(app).get('/student/999');
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toMatch(/not found/i);
    });

    test('200 returns student record', async () => {
        mockConn.execute.mockResolvedValueOnce({
            rows: [{ ID: 1, NAME: 'Alice', GPA: 88.5, OVERALL_ATTENDANCE: 82 }]
        });
        const res = await request(app).get('/student/1');
        expect(res.statusCode).toBe(200);
        expect(res.body.NAME).toBe('Alice');
        expect(res.body.GPA).toBe(88.5);
    });
});

// ---------------------------------------------------------------------------
// GET /student/:name/subjects
// ---------------------------------------------------------------------------
describe('GET /student/:name/subjects', () => {
    test('404 when student not found', async () => {
        mockConn.execute.mockResolvedValueOnce({ rows: [] });
        const res = await request(app).get('/student/UnknownStudent/subjects');
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toMatch(/not found/i);
    });

    test('200 returns subject rows for student', async () => {
        mockConn.execute
            .mockResolvedValueOnce({ rows: [{ ID: 1 }] })
            .mockResolvedValueOnce({
                rows: [
                    { SUBJECT: 'Math',    GRADES: 85, GRADE: 'B', ATTENDANCE: 80, RESULT: 'Pass' },
                    { SUBJECT: 'Science', GRADES: 90, GRADE: 'A', ATTENDANCE: 85, RESULT: 'Pass' },
                ]
            });
        const res = await request(app).get('/student/Alice/subjects');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0].SUBJECT).toBe('Math');
        expect(res.body[1].GRADE).toBe('A');
    });

    test('200 returns empty array when student has no subjects yet', async () => {
        mockConn.execute
            .mockResolvedValueOnce({ rows: [{ ID: 1 }] })
            .mockResolvedValueOnce({ rows: [] });
        const res = await request(app).get('/student/Alice/subjects');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// GET /student/:name/gpa
// ---------------------------------------------------------------------------
describe('GET /student/:name/gpa', () => {
    test('404 when student not found', async () => {
        mockConn.execute.mockResolvedValueOnce({ rows: [] });
        const res = await request(app).get('/student/UnknownStudent/gpa');
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toMatch(/not found/i);
    });

    test('200 returns GPA and overall attendance', async () => {
        mockConn.execute.mockResolvedValueOnce({
            rows: [{ GPA: 88.5, OVERALL_ATTENDANCE: 82 }]
        });
        const res = await request(app).get('/student/Alice/gpa');
        expect(res.statusCode).toBe(200);
        expect(res.body.GPA).toBe(88.5);
        expect(res.body.OVERALL_ATTENDANCE).toBe(82);
    });
});

// ---------------------------------------------------------------------------
// DELETE /student/:id
// ---------------------------------------------------------------------------
describe('DELETE /student/:id', () => {
    test('400 for non-numeric ID', async () => {
        const res = await request(app).delete('/student/abc');
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/invalid student id/i);
    });

    test('404 when student not found', async () => {
        mockConn.execute.mockResolvedValueOnce({ rows: [] });
        const res = await request(app).delete('/student/999');
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toMatch(/not found/i);
    });

    test('200 deletes student, subjects, and login account', async () => {
        mockConn.execute
            .mockResolvedValueOnce({ rows: [{ NAME: 'Alice' }] })  // SELECT NAME
            .mockResolvedValueOnce({ rowsAffected: 2 })            // DELETE subjects
            .mockResolvedValueOnce({ rowsAffected: 1 })            // DELETE students
            .mockResolvedValueOnce({ rowsAffected: 1 });           // DELETE login_users
        const res = await request(app).delete('/student/1');
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/Alice/);
        expect(res.body.message).toMatch(/deleted/i);
    });
});

// ---------------------------------------------------------------------------
// PUT /student/:id
// ---------------------------------------------------------------------------
describe('PUT /student/:id', () => {
    test('400 for non-numeric ID', async () => {
        const res = await request(app).put('/student/abc').send({ subject: 'Math', grades: 85, attendance: 80 });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/invalid student id/i);
    });

    test('400 when subject field is missing', async () => {
        const res = await request(app).put('/student/1').send({ grades: 85, attendance: 80 });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/subject is required/i);
    });

    test('404 when student not found', async () => {
        mockConn.execute.mockResolvedValueOnce({ rows: [] });
        const res = await request(app).put('/student/999').send({ subject: 'Math', grades: 85, attendance: 80 });
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toMatch(/not found/i);
    });

    test('404 when subject not found for student', async () => {
        mockConn.execute
            .mockResolvedValueOnce({ rows: [1] })   // student exists
            .mockResolvedValueOnce({ rows: [] });   // subject not found
        const res = await request(app).put('/student/1').send({ subject: 'History', grades: 85, attendance: 80 });
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toMatch(/not found/i);
    });

    test('400 for invalid grades or attendance (checked after student/subject exist)', async () => {
        mockConn.execute
            .mockResolvedValueOnce({ rows: [1] })          // student exists
            .mockResolvedValueOnce({ rows: [{ ID: 5 }] }); // subject exists
        const res = await request(app).put('/student/1').send({ subject: 'Math', grades: -5, attendance: 200 });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/invalid/i);
    });

    test('200 updates subject and recalculates GPA', async () => {
        mockConn.execute
            .mockResolvedValueOnce({ rows: [1] })                                  // student exists
            .mockResolvedValueOnce({ rows: [{ ID: 5 }] })                          // subject exists
            .mockResolvedValueOnce({ rowsAffected: 1 })                            // UPDATE subjects
            .mockResolvedValueOnce({ rows: [{ GRADES: 90, ATTENDANCE: 85 }] })     // SELECT all subjects for recalc
            .mockResolvedValueOnce({ rowsAffected: 1 });                           // UPDATE students GPA
        const res = await request(app).put('/student/1').send({ subject: 'Math', grades: 90, attendance: 85 });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Subject updated successfully!');
        expect(res.body.grade).toBe('A');
        expect(res.body.result).toBe('Pass');
        expect(res.body.gpa).toBe(90.0);
    });
});

// ---------------------------------------------------------------------------
// POST /api/performance
// ---------------------------------------------------------------------------
describe('POST /api/performance', () => {
    test('returns Pass for passing grade and attendance', async () => {
        const res = await request(app).post('/api/performance').send({ grade: 85, attendance: 80 });
        expect(res.statusCode).toBe(200);
        expect(res.body.performance).toBe('Pass');
    });

    test('returns Fail (Low Grades) when grade < 50 and attendance >= 75', async () => {
        const res = await request(app).post('/api/performance').send({ grade: 30, attendance: 80 });
        expect(res.statusCode).toBe(200);
        expect(res.body.performance).toBe('Fail (Low Grades)');
    });

    test('returns Fail (Low Attendance) when grade >= 50 and attendance < 75', async () => {
        const res = await request(app).post('/api/performance').send({ grade: 80, attendance: 50 });
        expect(res.statusCode).toBe(200);
        expect(res.body.performance).toBe('Fail (Low Attendance)');
    });

    test('returns Fail (Low Grades and Low Attendance) for both failures', async () => {
        const res = await request(app).post('/api/performance').send({ grade: 30, attendance: 50 });
        expect(res.statusCode).toBe(200);
        expect(res.body.performance).toBe('Fail (Low Grades and Low Attendance)');
    });

    test('returns Invalid Input for out-of-range values', async () => {
        const res = await request(app).post('/api/performance').send({ grade: -5, attendance: 200 });
        expect(res.statusCode).toBe(200);
        expect(res.body.performance).toBe('Invalid Input');
    });
});

// ---------------------------------------------------------------------------
// POST /calculate  (legacy endpoint — inserts using the old single-table schema)
// ---------------------------------------------------------------------------
describe('POST /calculate', () => {
    test('400 when name field is missing', async () => {
        const res = await request(app).post('/calculate').send({ grades: 85, attendance: 80 });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/name/i);
    });

    test('400 for invalid grades or attendance', async () => {
        // Validation runs before getConnection, so no DB mock needed
        const res = await request(app).post('/calculate').send({ name: 'Alice', grades: -5, attendance: 200 });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/invalid/i);
    });

    test('200 inserts student and returns result', async () => {
        mockConn.execute.mockResolvedValueOnce({ rowsAffected: 1 });
        const res = await request(app).post('/calculate').send({ name: 'Alice', grades: 85, attendance: 80 });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Student added successfully');
        expect(res.body.result).toBe('Pass');
    });

    test('200 returns correct result for failing grades', async () => {
        mockConn.execute.mockResolvedValueOnce({ rowsAffected: 1 });
        const res = await request(app).post('/calculate').send({ name: 'Bob', grades: 30, attendance: 80 });
        expect(res.statusCode).toBe(200);
        expect(res.body.result).toBe('Fail (Low Grades)');
    });
});
