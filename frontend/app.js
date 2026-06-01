// Submits the student name, subject, grades, and attendance to the server, then displays the grade and result
async function calculateResult() {
    let name = document.getElementById("name").value;
    let subject = document.getElementById("subject").value;
    let grades = parseFloat(document.getElementById("grades").value);
    let attendance = parseFloat(document.getElementById("attendance").value);

    let response = await fetch("http://localhost:3000/student", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            subject: subject,
            grades: grades,
            attendance: attendance
        })
    });

    let data = await response.json();

    if (!response.ok) {
        // Surface duplicate subject or other errors to the user
        document.getElementById("result").innerText = `Error: ${data.message}`;
        return;
    }

    document.getElementById("subject").value = "";
    document.getElementById("grades").value = "";
    document.getElementById("attendance").value = "";
    document.getElementById("result").innerText =
        `Grade: ${data.grades}\nResult: ${data.result}`;
}

// Fetches and displays the GPA and overall attendance for the student entered in the name field
async function viewGPA() {
    const name = document.getElementById("name").value;
    const container = document.getElementById("gpa-card-container");

    const response = await fetch(`http://localhost:3000/student/${encodeURIComponent(name)}/gpa`);
    const data = await response.json();

    if (!response.ok) {
        container.innerHTML = `<p class="grades-error">Error: ${data.message}</p>`;
        return;
    }

    container.innerHTML = `
        <div class="card gpa-card">
            <h3>Overall Performance</h3>
            <p><strong>GPA:</strong> ${data.GPA}</p>
            <p><strong>Overall Attendance:</strong> ${data.OVERALL_ATTENDANCE}%</p>
        </div>`;
}

// Fetches and renders a table of all subject records for the student entered in the name field
async function viewGrades() {
    const name = document.getElementById("name").value;

    const response = await fetch(`http://localhost:3000/student/${encodeURIComponent(name)}/subjects`);
    const container = document.getElementById("grades-table-container");

    if (!response.ok) {
        const data = await response.json();
        container.innerHTML = `<p class="grades-error">Error: ${data.message}</p>`;
        return;
    }

    const rows = await response.json();

    if (rows.length === 0) {
        container.innerHTML = `<p class="grades-error">No subjects found for ${name}.</p>`;
        return;
    }

    const tableRows = rows.map(r => `
        <tr>
            <td>${r.SUBJECT}</td>
            <td>${r.GRADES}</td>
            <td>${r.GRADE}</td>
            <td>${r.ATTENDANCE}</td>
            <td>${r.RESULT}</td>
        </tr>`).join("");

    container.innerHTML = `
        <table class="grades-table">
            <thead>
                <tr>
                    <th>Subject</th>
                    <th>Grade</th>
                    <th>Letter</th>
                    <th>Attendance</th>
                    <th>Result</th>
                </tr>
            </thead>
            <tbody>${tableRows}</tbody>
        </table>`;
}
