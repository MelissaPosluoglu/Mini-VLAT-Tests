async function loadResults(testType, tableId) {
    const response = await fetch(`http://localhost:8000/results/${testType}`);
    const data = await response.json();

    const table = document.getElementById(tableId);
    const tbody = table.querySelector("tbody");

    // Tabelle leeren
    tbody.innerHTML = "";

    data.forEach(entry => {
        const answersFormatted = entry.answers
            .map(a => `${a.question_id}: ${a.time_taken.toFixed(2)}s — ${a.is_correct ? "✔" : "❌"}`)
            .join("<br>");

        const totalTimeFormatted =
            entry.total_time != null
                ? Number(entry.total_time).toFixed(2) + "s"
                : "-";

        tbody.innerHTML += `
            <tr>
                <td>${entry.participantNumber}</td>
                <td>${answersFormatted}</td>
                <td>${totalTimeFormatted}</td>
                <td>${entry.score ?? "-"}</td>
                <td>
                    <button class="feedback-btn" onclick="viewFeedback('${entry.participantNumber}')">
                        Feedback ansehen
                    </button>
                </td>
            </tr>
        `;
    });
}

loadResults("A", "tableA");
loadResults("B", "tableB");
loadResults("C", "tableC");


// Teilnehmer löschen
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


// Feedback ansehen
function viewFeedback(participantNumber) {
    window.location.href = `feedback-view.html?participant=${participantNumber}`;
}
