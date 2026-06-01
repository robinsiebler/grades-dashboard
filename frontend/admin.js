const API_BASE = 'http://localhost:3000';
const PANELS   = ['get-all', 'get-id', 'get-name', 'top10', 'low-att', 'analytics', 'update', 'delete'];

function logout() {
    sessionStorage.removeItem('loggedInUser');
    window.location.href = '/frontend/login.html';
}

function showPanel(name) {
    PANELS.forEach(p => {
        document.getElementById(`panel-${p}`).classList.remove('visible');
        document.getElementById(`btn-${p}`).classList.remove('active');
    });
    document.getElementById(`panel-${name}`).classList.add('visible');
    document.getElementById(`btn-${name}`).classList.add('active');
    document.getElementById('results-panel').innerHTML = '';
}

function renderTable(rows, columns) {
    if (rows.length === 0) return '<p>No results found.</p>';
    const headers = columns.map(c => `<th>${c.label}</th>`).join('');
    const body    = rows.map(r =>
        `<tr>${columns.map(c => `<td>${r[c.key] ?? ''}</td>`).join('')}</tr>`
    ).join('');
    return `<table class="results-table">
                <thead><tr>${headers}</tr></thead>
                <tbody>${body}</tbody>
            </table>`;
}

const STUDENT_COLS = [
    { key: 'ID',                 label: 'ID' },
    { key: 'NAME',               label: 'Name' },
    { key: 'GPA',                label: 'GPA' },
    { key: 'OVERALL_ATTENDANCE', label: 'Attendance' }
];

const SUBJECT_COLS = [
    { key: 'SUBJECT',    label: 'Subject' },
    { key: 'GRADES',     label: 'Grade' },
    { key: 'GRADE',      label: 'Letter' },
    { key: 'ATTENDANCE', label: 'Attendance' },
    { key: 'RESULT',     label: 'Result' }
];

function renderStudentWithSubjects(student, subjects) {
    const subjectsHtml = subjects.length > 0
        ? renderTable(subjects, SUBJECT_COLS)
        : '<p style="color:#666; margin-top:8px;">No subjects recorded.</p>';
    return `${renderTable([student], STUDENT_COLS)}
            <h4 style="margin:16px 0 4px;">Subjects</h4>${subjectsHtml}`;
}

async function getAnalytics() {
    const panel = document.getElementById('results-panel');
    try {
        const res  = await fetch(`${API_BASE}/analytics`);
        const data = await res.json();
        if (!res.ok) { panel.innerHTML = `<p class="error-msg">${data.message}</p>`; return; }

        const { overall, fail_reasons, by_subject, by_student } = data;

        const overallTable = renderTable([{
            TOTAL:     overall.total,
            PASSED:    overall.passed,
            FAILED:    overall.failed,
            PASS_RATE: overall.pass_rate + '%'
        }], [
            { key: 'TOTAL',     label: 'Total Subjects' },
            { key: 'PASSED',    label: 'Passed'         },
            { key: 'FAILED',    label: 'Failed'         },
            { key: 'PASS_RATE', label: 'Pass Rate'      }
        ]);

        const failTable = renderTable([{
            LOW_GRADES:     fail_reasons.FAIL_LOW_GRADES,
            LOW_ATTENDANCE: fail_reasons.FAIL_LOW_ATTENDANCE,
            BOTH:           fail_reasons.FAIL_BOTH
        }], [
            { key: 'LOW_GRADES',     label: 'Low Grades'            },
            { key: 'LOW_ATTENDANCE', label: 'Low Attendance'         },
            { key: 'BOTH',           label: 'Low Grades & Attendance'}
        ]);

        const subjectTable = renderTable(
            by_subject.map(r => ({ ...r, pass_rate: r.pass_rate + '%' })),
            [
                { key: 'subject',   label: 'Subject'   },
                { key: 'total',     label: 'Total'     },
                { key: 'passed',    label: 'Passed'    },
                { key: 'failed',    label: 'Failed'    },
                { key: 'pass_rate', label: 'Pass Rate' }
            ]
        );

        const studentTable = renderTable(
            by_student.map(r => ({ ...r, pass_rate: r.pass_rate + '%' })),
            [
                { key: 'name',      label: 'Student'   },
                { key: 'total',     label: 'Total'     },
                { key: 'passed',    label: 'Passed'    },
                { key: 'failed',    label: 'Failed'    },
                { key: 'pass_rate', label: 'Pass Rate' }
            ]
        );

        panel.innerHTML = `
            <h4 style="margin:0 0 6px;">Overall</h4>${overallTable}
            <h4 style="margin:20px 0 6px;">Fail Reasons</h4>${failTable}
            <h4 style="margin:20px 0 6px;">By Subject</h4>${subjectTable}
            <h4 style="margin:20px 0 6px;">By Student</h4>${studentTable}`;
    } catch (e) {
        panel.innerHTML = `<p class="error-msg">Request failed: ${e.message}</p>`;
    }
}

async function getLowAttendance() {
    const panel = document.getElementById('results-panel');
    try {
        const res  = await fetch(`${API_BASE}/low-attendance`);
        const data = await res.json();
        if (!res.ok) { panel.innerHTML = `<p class="error-msg">${data.message}</p>`; return; }
        panel.innerHTML = renderTable(data, [
            { key: 'NAME',               label: 'Name'       },
            { key: 'OVERALL_ATTENDANCE', label: 'Attendance' }
        ]);
    } catch (e) {
        panel.innerHTML = `<p class="error-msg">Request failed: ${e.message}</p>`;
    }
}

async function getToppers() {
    const panel = document.getElementById('results-panel');
    try {
        const res  = await fetch(`${API_BASE}/toppers`);
        const data = await res.json();
        if (!res.ok) { panel.innerHTML = `<p class="error-msg">${data.message}</p>`; return; }

        const gpaTable = renderTable(data.gpaToppers, [
            { key: 'NAME', label: 'Name' },
            { key: 'GPA',  label: 'GPA'  }
        ]);

        const subjectTable = renderTable(data.subjectToppers, [
            { key: 'NAME',    label: 'Name'    },
            { key: 'SUBJECT', label: 'Subject' },
            { key: 'GRADES',  label: 'Grade'   }
        ]);

        panel.innerHTML = `
            <h4 style="margin:0 0 6px;">Students with GPA &ge; 90</h4>
            ${gpaTable}
            <h4 style="margin:20px 0 6px;">Students with a subject grade &ge; 90</h4>
            ${subjectTable}`;
    } catch (e) {
        panel.innerHTML = `<p class="error-msg">Request failed: ${e.message}</p>`;
    }
}

async function getStudents() {
    const panel = document.getElementById('results-panel');
    try {
        const res  = await fetch(`${API_BASE}/students`);
        const data = await res.json();
        panel.innerHTML = res.ok
            ? renderTable(data, STUDENT_COLS)
            : `<p class="error-msg">${data.message}</p>`;
    } catch (e) {
        panel.innerHTML = `<p class="error-msg">Request failed: ${e.message}</p>`;
    }
}

async function getStudentById() {
    const id    = document.getElementById('input-get-id').value.trim();
    const panel = document.getElementById('results-panel');
    if (!id) { panel.innerHTML = '<p class="error-msg">Please enter a student ID.</p>'; return; }
    try {
        const studentRes = await fetch(`${API_BASE}/student/${encodeURIComponent(id)}`);
        const student    = await studentRes.json();
        if (!studentRes.ok) { panel.innerHTML = `<p class="error-msg">${student.message}</p>`; return; }

        const subjectsRes = await fetch(`${API_BASE}/student/${encodeURIComponent(student.NAME)}/subjects`);
        const subjects    = subjectsRes.ok ? await subjectsRes.json() : [];

        panel.innerHTML = renderStudentWithSubjects(student, subjects);
    } catch (e) {
        panel.innerHTML = `<p class="error-msg">Request failed: ${e.message}</p>`;
    }
}

async function getStudentByName() {
    const name  = document.getElementById('input-get-name').value.trim();
    const panel = document.getElementById('results-panel');
    if (!name) { panel.innerHTML = '<p class="error-msg">Please enter a student name.</p>'; return; }
    try {
        const searchRes = await fetch(`${API_BASE}/search?name=${encodeURIComponent(name)}`);
        const students  = await searchRes.json();
        if (!searchRes.ok) { panel.innerHTML = `<p class="error-msg">${students.message}</p>`; return; }
        if (students.length === 0) { panel.innerHTML = '<p>No results found.</p>'; return; }

        // Fetch subjects for all matching students in parallel
        const allSubjects = await Promise.all(
            students.map(s =>
                fetch(`${API_BASE}/student/${encodeURIComponent(s.NAME)}/subjects`)
                    .then(r => r.ok ? r.json() : [])
            )
        );

        panel.innerHTML = students
            .map((s, i) => renderStudentWithSubjects(s, allSubjects[i]))
            .join('<hr style="margin:20px 0;">');
    } catch (e) {
        panel.innerHTML = `<p class="error-msg">Request failed: ${e.message}</p>`;
    }
}

async function updateStudent() {
    const id         = document.getElementById('input-update-id').value.trim();
    const subject    = document.getElementById('input-update-subject').value.trim();
    const grades     = document.getElementById('input-update-grades').value;
    const attendance = document.getElementById('input-update-attendance').value;
    const panel      = document.getElementById('results-panel');

    if (!id || !subject || grades === '' || attendance === '') {
        panel.innerHTML = '<p class="error-msg">Please fill in all fields.</p>';
        return;
    }
    if (Number(grades) < 0 || Number(grades) > 100 || Number(attendance) < 0 || Number(attendance) > 100) {
        panel.innerHTML = '<p class="error-msg">Grade and attendance must be between 0 and 100.</p>';
        return;
    }
    try {
        const res  = await fetch(`${API_BASE}/student/${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, grades: Number(grades), attendance: Number(attendance) })
        });
        const data = await res.json();
        if (!res.ok) { panel.innerHTML = `<p class="error-msg">${data.message}</p>`; return; }
        panel.innerHTML = `
            <p class="success-msg">${data.message}</p>
            <div class="result-card">
                <p><strong>Subject:</strong> ${data.subject}</p>
                <p><strong>Grade:</strong> ${data.grades} (${data.grade})</p>
                <p><strong>Attendance:</strong> ${data.attendance}%</p>
                <p><strong>Result:</strong> ${data.result}</p>
                <p><strong>Updated GPA:</strong> ${data.gpa}</p>
                <p><strong>Updated Overall Attendance:</strong> ${data.overall_attendance}%</p>
            </div>`;
    } catch (e) {
        panel.innerHTML = `<p class="error-msg">Request failed: ${e.message}</p>`;
    }
}

async function deleteStudent() {
    const id    = document.getElementById('input-delete-id').value.trim();
    const panel = document.getElementById('results-panel');
    if (!id) { panel.innerHTML = '<p class="error-msg">Please enter a student ID.</p>'; return; }
    try {
        const res  = await fetch(`${API_BASE}/student/${encodeURIComponent(id)}`, { method: 'DELETE' });
        const data = await res.json();
        panel.innerHTML = res.ok
            ? `<p class="success-msg">${data.message}</p>`
            : `<p class="error-msg">${data.message}</p>`;
    } catch (e) {
        panel.innerHTML = `<p class="error-msg">Request failed: ${e.message}</p>`;
    }
}
