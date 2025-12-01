async function loadResults(testType, tableId) {
    const response = await fetch(`http://localhost:8000/results/${testType}`);
    const data = await response.json();

    const table = document.getElementById(tableId);

    table.innerHTML = `
        <tr>
            <th>Nummer</th>
            <th>Fragen (Dauer / Richtig?)</th>
            <th>Gesamtdauer</th>
            <th>Score</th>
        </tr>
    `;

    data.forEach(entry => {

        const answersFormatted = entry.answers.map(a =>
            `${a.question_id}: ${a.time_taken}s — ${a.is_correct ? "✔" : "❌"}`
        ).join("<br>");

        table.innerHTML += `
            <tr>
                <td>${entry.participantNumber}</td>
                <td>${answersFormatted}</td>
                <td>${entry.total_time ?? "-"}</td>
                <td>${entry.score ?? "-"}</td>
            </tr>
        `;
    });
}

loadResults("A", "tableA");
loadResults("B", "tableB");
loadResults("C", "tableC");
