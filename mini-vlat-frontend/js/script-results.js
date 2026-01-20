// =====================================================
// RESULTS VIEW SCRIPT
// Loads test results, handles deletion and feedback view
// =====================================================

/**
 * Fetches and renders results for a given test type
 * @param {string} testType - Test identifier (A, B, C, D)
 * @param {string} tableId - HTML table ID where results are rendered
 */
const API_BASE =  "http://localhost:8000";

async function loadResults(testType, tableId) {
    const response = await fetch(`${API_BASE}/results/${testType}`);
    const data = await response.json();

    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = "";

    data.forEach(entry => {
        const tr = document.createElement("tr");

        // Build detailed answer list (question, time, correctness)
        const answersHTML = entry.answers
            .map(a => `${a.question_id}: ${fmt1(a.time_taken)}s — ${a.is_correct ? "✔" : "✖"}`)
            .join("<br>");

        tr.innerHTML = `
            <td>
                <span class="participant-name" id="name-${entry._id}">
                    ${entry.participantNumber}
                </span>

                <input
                    type="text"
                    class="edit-input"
                    id="input-${entry._id}"
                    value="${entry.participantNumber}"
                    style="display:none; width:90px;"
                >

                <button class="edit-btn" onclick="editName('${entry._id}')">✏️</button>
                <button class="save-btn" onclick="saveName('${entry._id}')" style="display:none;">💾</button>
            </td>

            <td>${fmt1(entry.total_time)}</td>
            <td><span class="score-badge">${entry.score ?? "-"}</span></td>

            <td>
                <div class="answers-btn" onclick="toggleAnswers(this)">
                    anzeigen ▼
                </div>
                <div class="answer-box">${answersHTML}</div>
            </td>

            <td>
                <button class="feedback-btn" onclick="viewFeedback('${entry._id}')">
                    Feedback
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

/**
 * Formats a number with one decimal place
 * Returns "-" if value is null or undefined
 */
function fmt1(x) {
    if (x === null || x === undefined) return "-";
    return Number(x).toFixed(1);
}

/**
 * Toggles visibility of the answer details for a result row
 */
function toggleAnswers(el) {
    const box = el.nextElementSibling;
    const visible = box.style.display === "block";
    box.style.display = visible ? "none" : "block";
    el.textContent = visible ? "anzeigen ▼" : "verbergen ▲";
}


// -----------------------------------------------------
// INITIAL LOAD FOR ALL TEST VARIANTS
// -----------------------------------------------------

loadResults("A", "tableA");
loadResults("B", "tableB");
loadResults("C", "tableC");
loadResults("D", "tableD");


// -----------------------------------------------------
// DELETE PARTICIPANT (ALL TESTS + FEEDBACK)
// -----------------------------------------------------

async function deleteParticipant() {
    const participantNumber = document.getElementById("deleteInput").value.trim();

    if (!participantNumber) {
        alert("Bitte eine Teilnehmernummer eingeben!");
        return;
    }

    const confirmDelete = confirm(`Soll der Teilnehmer ${participantNumber} wirklich gelöscht werden?`);
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_BASE}/delete/${participantNumber}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert(`Teilnehmer ${participantNumber} erfolgreich gelöscht.`);
            location.reload();
        } else {
            const error = await response.json();
            alert(`Fehler: ${error.detail || "Löschen nicht möglich"}`);
        }
    } catch (err) {
        console.error(err);
        alert("Serverfehler beim Löschen.");
    }
}

// -----------------------------------------------------
// NAVIGATION HELPERS
// -----------------------------------------------------

/**
 * Opens feedback detail view for a specific test
 */
function viewFeedback(testId) {
    window.location.href =
        `../html/feedback-view.html?test_id=${encodeURIComponent(testId)}`;
}

/**
 * Navigate back to the start page
 */
function goHome() {
    window.location.href = "../index.html";
}


// -----------------------------------------------------
// EDIT PARTICIPANT NAME
// -----------------------------------------------------

function editName(testId) {
    document.getElementById(`name-${testId}`).style.display = "none";
    document.getElementById(`input-${testId}`).style.display = "inline-block";

    document.querySelector(`[onclick="editName('${testId}')"]`).style.display = "none";
    document.querySelector(`[onclick="saveName('${testId}')"]`).style.display = "inline-block";
}

async function saveName(testId) {
    const input = document.getElementById(`input-${testId}`);
    const newName = input.value.trim();

    if (!newName) {
        alert("Name darf nicht leer sein");
        return;
    }

    try {
        const res = await fetch(
            `${API_BASE}/participant/${testId}?participantNumber=${encodeURIComponent(newName)}`,
            { method: "PATCH" }
        );

        if (!res.ok) throw new Error("Update fehlgeschlagen");

        document.getElementById(`name-${testId}`).textContent = newName;
        document.getElementById(`name-${testId}`).style.display = "inline";
        document.getElementById(`input-${testId}`).style.display = "none";

        document.querySelector(`[onclick="editName('${testId}')"]`).style.display = "inline-block";
        document.querySelector(`[onclick="saveName('${testId}')"]`).style.display = "none";

    } catch (err) {
        console.error(err);
        alert("Name konnte nicht gespeichert werden");
    }
}


function getTestTypeFromRow(testId) {
    if (document.querySelector(`#tableA #name-${testId}`)) return "A";
    if (document.querySelector(`#tableB #name-${testId}`)) return "B";
    if (document.querySelector(`#tableC #name-${testId}`)) return "C";
    if (document.querySelector(`#tableD #name-${testId}`)) return "D";
    return null;
}
