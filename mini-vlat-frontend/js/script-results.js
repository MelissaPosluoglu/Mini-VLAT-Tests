async function loadResults(testType, tableId) {
    const response = await fetch(`http://localhost:8000/results/${testType}`);
    const data = await response.json();

    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = "";

    data.forEach(entry => {
        const tr = document.createElement("tr");

        const answersHTML = entry.answers
            .map(a => `${a.question_id}: ${a.time_taken}s — ${a.is_correct ? "✔" : "✖"}`)
            .join("<br>");

        tr.innerHTML = `
            <td>${entry.participantNumber}</td>
            <td>${entry.total_time ?? "-"}</td>
            <td><span class="score-badge">${entry.score ?? "-"}</span></td>

            <td>
                <div class="answers-btn" onclick="toggleAnswers(this)">
                    anzeigen ▼
                </div>
                <div class="answer-box">${answersHTML}</div>
            </td>

            <td>
                <button class="feedback-btn" onclick="viewFeedback('${entry.participantNumber}')">
                    Feedback
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function toggleAnswers(el) {
    const box = el.nextElementSibling;
    const visible = box.style.display === "block";
    box.style.display = visible ? "none" : "block";
    el.textContent = visible ? "anzeigen ▼" : "verbergen ▲";
}

loadResults("A", "tableA");
loadResults("B", "tableB");
loadResults("C", "tableC");


async function deleteParticipant() {
    const participantNumber = document.getElementById("deleteInput").value.trim();

    if (!participantNumber) {
        alert("Bitte eine Teilnehmernummer eingeben!");
        return;
    }

    const confirmDelete = confirm(`Soll der Teilnehmer ${participantNumber} wirklich gelöscht werden?`);
    if (!confirmDelete) return;

    try {
        const response = await fetch(`http://localhost:8000/delete/${participantNumber}`, {
            method: "DELETE"
        });

        if (response.ok) {
            const result = await response.json();
            alert(`Teilnehmer ${participantNumber} erfolgreich gelöscht.`);
            location.reload(); // Seite neu laden, um Tabellen zu aktualisieren
        } else {
            const error = await response.json();
            alert(`Fehler: ${error.detail || "Löschen nicht möglich"}`);
        }
    } catch (err) {
        console.error(err);
        alert("Serverfehler beim Löschen.");
    }
}

function viewFeedback(participantNumber) {
    window.location.href = `feedback-view.html?participant=${participantNumber}`;
}
