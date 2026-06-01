const getConnection = require('./db');

describe('Database Connection', () => {
    test('connects successfully and exposes an execute method', async () => {
        let connection;
        try {
            connection = await getConnection();
            expect(connection).toBeDefined();
            expect(typeof connection.execute).toBe('function');
        } finally {
            if (connection) await connection.close();
        }
    });
});

describe('Database Testing', () => {
    let conn;

    beforeEach(async () => {
        conn = await getConnection();
    });

    afterEach(async () => {
        if (conn) await conn.close();
    });

    // -------------------------------------------------------------------------
    // STUDENTS table
    // -------------------------------------------------------------------------
    describe('STUDENTS table', () => {
        test('has at least one row', async () => {
            const result = await conn.execute('SELECT COUNT(*) FROM STUDENTS');
            expect(result.rows[0][0]).toBeGreaterThan(0);
        });

        test('NAME is never NULL', async () => {
            const result = await conn.execute('SELECT COUNT(*) FROM STUDENTS WHERE NAME IS NULL');
            expect(result.rows[0][0]).toBe(0);
        });

        test('GPA is never NULL', async () => {
            const result = await conn.execute('SELECT COUNT(*) FROM STUDENTS WHERE GPA IS NULL');
            expect(result.rows[0][0]).toBe(0);
        });

        test('OVERALL_ATTENDANCE is never NULL', async () => {
            const result = await conn.execute('SELECT COUNT(*) FROM STUDENTS WHERE OVERALL_ATTENDANCE IS NULL');
            expect(result.rows[0][0]).toBe(0);
        });

        test('all GPA values are within 0–100', async () => {
            const result = await conn.execute('SELECT COUNT(*) FROM STUDENTS WHERE GPA < 0 OR GPA > 100');
            expect(result.rows[0][0]).toBe(0);
        });

        test('all OVERALL_ATTENDANCE values are within 0–100', async () => {
            const result = await conn.execute(
                'SELECT COUNT(*) FROM STUDENTS WHERE OVERALL_ATTENDANCE < 0 OR OVERALL_ATTENDANCE > 100'
            );
            expect(result.rows[0][0]).toBe(0);
        });
    });

    // -------------------------------------------------------------------------
    // SUBJECTS table
    // -------------------------------------------------------------------------
    describe('SUBJECTS table', () => {
        test('has at least one row', async () => {
            const result = await conn.execute('SELECT COUNT(*) FROM SUBJECTS');
            expect(result.rows[0][0]).toBeGreaterThan(0);
        });

        test('SUBJECT is never NULL', async () => {
            const result = await conn.execute('SELECT COUNT(*) FROM SUBJECTS WHERE SUBJECT IS NULL');
            expect(result.rows[0][0]).toBe(0);
        });

        test('GRADES is never NULL', async () => {
            const result = await conn.execute('SELECT COUNT(*) FROM SUBJECTS WHERE GRADES IS NULL');
            expect(result.rows[0][0]).toBe(0);
        });

        test('GRADE is never NULL', async () => {
            const result = await conn.execute('SELECT COUNT(*) FROM SUBJECTS WHERE GRADE IS NULL');
            expect(result.rows[0][0]).toBe(0);
        });

        test('ATTENDANCE is never NULL', async () => {
            const result = await conn.execute('SELECT COUNT(*) FROM SUBJECTS WHERE ATTENDANCE IS NULL');
            expect(result.rows[0][0]).toBe(0);
        });

        test('RESULT is never NULL', async () => {
            const result = await conn.execute('SELECT COUNT(*) FROM SUBJECTS WHERE RESULT IS NULL');
            expect(result.rows[0][0]).toBe(0);
        });

        test('all GRADES values are within 0–100', async () => {
            const result = await conn.execute('SELECT COUNT(*) FROM SUBJECTS WHERE GRADES < 0 OR GRADES > 100');
            expect(result.rows[0][0]).toBe(0);
        });

        test('all ATTENDANCE values are within 0–100', async () => {
            const result = await conn.execute('SELECT COUNT(*) FROM SUBJECTS WHERE ATTENDANCE < 0 OR ATTENDANCE > 100');
            expect(result.rows[0][0]).toBe(0);
        });

        test('GRADE only contains valid letter grades (A, B, C, Fail)', async () => {
            const result = await conn.execute(
                `SELECT COUNT(*) FROM SUBJECTS WHERE GRADE NOT IN ('A', 'B', 'C', 'Fail')`
            );
            expect(result.rows[0][0]).toBe(0);
        });

        test('RESULT only contains valid result strings', async () => {
            const result = await conn.execute(
                `SELECT COUNT(*) FROM SUBJECTS
                 WHERE RESULT NOT IN (
                     'Pass',
                     'Fail (Low Grades)',
                     'Fail (Low Attendance)',
                     'Fail (Low Grades and Low Attendance)'
                 )`
            );
            expect(result.rows[0][0]).toBe(0);
        });

        test('at least one passing result exists', async () => {
            const result = await conn.execute(`SELECT COUNT(*) FROM SUBJECTS WHERE RESULT = 'Pass'`);
            expect(result.rows[0][0]).toBeGreaterThan(0);
        });

        test('at least one failing result exists', async () => {
            const result = await conn.execute(`SELECT COUNT(*) FROM SUBJECTS WHERE RESULT LIKE 'Fail%'`);
            expect(result.rows[0][0]).toBeGreaterThan(0);
        });

        test('at least one passing attendance exists (>= 75)', async () => {
            const result = await conn.execute('SELECT COUNT(*) FROM SUBJECTS WHERE ATTENDANCE >= 75');
            expect(result.rows[0][0]).toBeGreaterThan(0);
        });

        test('at least one failing attendance exists (< 75)', async () => {
            const result = await conn.execute('SELECT COUNT(*) FROM SUBJECTS WHERE ATTENDANCE < 75');
            expect(result.rows[0][0]).toBeGreaterThan(0);
        });

        test('at least one record with both failing grade and failing attendance', async () => {
            const result = await conn.execute(
                'SELECT COUNT(*) FROM SUBJECTS WHERE GRADES < 50 AND ATTENDANCE < 75'
            );
            expect(result.rows[0][0]).toBeGreaterThan(0);
        });
    });

    // -------------------------------------------------------------------------
    // Referential integrity
    // -------------------------------------------------------------------------
    describe('Referential integrity', () => {
        test('every SUBJECTS.STUDENT_ID references an existing STUDENTS row', async () => {
            const result = await conn.execute(
                `SELECT COUNT(*) FROM SUBJECTS sub
                 WHERE NOT EXISTS (
                     SELECT 1 FROM STUDENTS st WHERE st.ID = sub.STUDENT_ID
                 )`
            );
            expect(result.rows[0][0]).toBe(0);
        });
    });

    // -------------------------------------------------------------------------
    // Result logic consistency
    // -------------------------------------------------------------------------
    describe('Result logic consistency', () => {
        test('Pass results have GRADES >= 50 and ATTENDANCE >= 75', async () => {
            const result = await conn.execute(
                `SELECT COUNT(*) FROM SUBJECTS
                 WHERE RESULT = 'Pass' AND (GRADES < 50 OR ATTENDANCE < 75)`
            );
            expect(result.rows[0][0]).toBe(0);
        });

        test('Fail (Low Grades) results have GRADES < 50 and ATTENDANCE >= 75', async () => {
            const result = await conn.execute(
                `SELECT COUNT(*) FROM SUBJECTS
                 WHERE RESULT = 'Fail (Low Grades)' AND (GRADES >= 50 OR ATTENDANCE < 75)`
            );
            expect(result.rows[0][0]).toBe(0);
        });

        test('Fail (Low Attendance) results have GRADES >= 50 and ATTENDANCE < 75', async () => {
            const result = await conn.execute(
                `SELECT COUNT(*) FROM SUBJECTS
                 WHERE RESULT = 'Fail (Low Attendance)' AND (GRADES < 50 OR ATTENDANCE >= 75)`
            );
            expect(result.rows[0][0]).toBe(0);
        });

        test('Fail (Low Grades and Low Attendance) results have GRADES < 50 and ATTENDANCE < 75', async () => {
            const result = await conn.execute(
                `SELECT COUNT(*) FROM SUBJECTS
                 WHERE RESULT = 'Fail (Low Grades and Low Attendance)' AND (GRADES >= 50 OR ATTENDANCE >= 75)`
            );
            expect(result.rows[0][0]).toBe(0);
        });

        test('GRADE column matches the GRADES score', async () => {
            const result = await conn.execute(
                `SELECT COUNT(*) FROM SUBJECTS
                 WHERE (GRADES >= 90 AND GRADE != 'A')
                    OR (GRADES >= 75 AND GRADES < 90 AND GRADE != 'B')
                    OR (GRADES >= 50 AND GRADES < 75 AND GRADE != 'C')
                    OR (GRADES < 50  AND GRADE != 'Fail')`
            );
            expect(result.rows[0][0]).toBe(0);
        });
    });

    // -------------------------------------------------------------------------
    // LOGIN_USERS table
    // -------------------------------------------------------------------------
    describe('LOGIN_USERS table', () => {
        test('has at least one row', async () => {
            const result = await conn.execute('SELECT COUNT(*) FROM LOGIN_USERS');
            expect(result.rows[0][0]).toBeGreaterThan(0);
        });

        test('USERNAME is never NULL', async () => {
            const result = await conn.execute('SELECT COUNT(*) FROM LOGIN_USERS WHERE USERNAME IS NULL');
            expect(result.rows[0][0]).toBe(0);
        });

        test('PASSWORD_HASH is never NULL', async () => {
            const result = await conn.execute('SELECT COUNT(*) FROM LOGIN_USERS WHERE PASSWORD_HASH IS NULL');
            expect(result.rows[0][0]).toBe(0);
        });

        test('ADMIN flag is only 0 or 1', async () => {
            const result = await conn.execute('SELECT COUNT(*) FROM LOGIN_USERS WHERE ADMIN NOT IN (0, 1)');
            expect(result.rows[0][0]).toBe(0);
        });
    });
});
