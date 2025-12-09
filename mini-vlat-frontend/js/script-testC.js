// =====================================================
// MINI-VLAT — Test C (Zweistufig: View → Answer)
// FINAL STABLE VERSION
// =====================================================

// -----------------------------------------------------
// STATE
// -----------------------------------------------------
let scoreC = 0;
let selectedAnswerC = "No Answer";


// -----------------------------------------------------
// 1) LOGIK FÜR testC.html (Startseite)
// -----------------------------------------------------
if (location.pathname.endsWith("testC.html")) {

    document.addEventListener("DOMContentLoaded", () => {

        const numberScreen = document.getElementById("number-input-screen");
        const intro = document.getElementById("testC-intro");

        // Keine Teilnehmernummer → Eingabe
        if (!localStorage.getItem("participantNumber")) {
            numberScreen.style.display = "block";
            return;
        }

        // Nummer existiert → Intro
        intro.style.display = "block";
    });

    // Nummer speichern
    document.getElementById("startNumberBtn")?.addEventListener("click", () => {
        const num = document.getElementById("participantNumber").value.trim();
        if (!num) return alert("Bitte gültige Nummer eingeben!");

        localStorage.setItem("participantNumber", num);

        document.getElementById("number-input-screen").style.display = "none";
        document.getElementById("testC-intro").style.display = "block";
    });

    // Test starten
    document.getElementById("startTestC")?.addEventListener("click", async () => {

        scoreC = 0;

        const response = await fetch("http://localhost:8000/start", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                participantNumber: localStorage.getItem("participantNumber"),
                test_type: "C"
            })
        });

        const data = await response.json();
        localStorage.setItem("test_id_C", data.test_id);

        // Erste Frage → View-Modus
        location.href = "./questions/q1_treemap.html?mode=view";
    });
}



// -----------------------------------------------------
// 2) QUESTION-PAGE LOGIK — läuft auf q1, q2, ..., q12
// -----------------------------------------------------
if (location.pathname.includes("/questions/")) {

    document.addEventListener("DOMContentLoaded", () => {

        const app = document.getElementById("app");

        const params = new URLSearchParams(location.search);
        const id   = params.get("q");
        const mode = params.get("mode");

        const qIndex = questions.findIndex(q => q.id === id);

        if (params.get("done") === "true") {
            showResultC();
            return;
        }

        if (qIndex === -1) return console.error("Invalid question ID");

        // View- oder Answer-Modus abhängig vom Parameter
        if (mode === "answer") renderAnswerC(qIndex);
        else renderViewC(qIndex);
    });
}



// -----------------------------------------------------
// 3) VIEW MODE
// -----------------------------------------------------
function renderViewC(index) {

    const q = questions[index];

    updateProgressC(index);

    document.getElementById("app").innerHTML = `
        <h2 class="prompt-text">${q.prompt}</h2>

        <img src="${q.img}" class="vlat-image">

        <button class="start-btn"
            onclick="location.href='?q=${q.id}&mode=answer'">
            Weiter
        </button>
    `;
}



// -----------------------------------------------------
// 4) ANSWER MODE
// -----------------------------------------------------
function renderAnswerC(index) {

    const q = questions[index];
    selectedAnswerC = "No Answer";

    updateProgressC(index);

    document.getElementById("app").innerHTML = `
        <h2 class="prompt-text">${q.prompt}</h2>

        <ul class="answers">
            ${q.answers.map(a => `
                <li class="${a === 'No Answer' ? 'selected' : ''}"
                    onclick="selectAnswerC('${a}')">${a}</li>
            `).join("")}
        </ul>

        <div class="nav-row">
            <button class="nav-btn back-btn"
                    onclick="location.href='?q=${q.id}&mode=view'">Zurück</button>

            <button class="nav-btn next-btn"
                    id="nextBtnC" disabled>Weiter</button>
        </div>
    `;

    document.getElementById("nextBtnC").onclick = () => finishQuestionC(index);
}



// -----------------------------------------------------
// 5) ANSWER CLICK
// -----------------------------------------------------
function selectAnswerC(answer) {

    selectedAnswerC = answer;

    document.querySelectorAll(".answers li").forEach(li => {
        li.classList.toggle("selected", li.innerText === answer);
    });

    document.getElementById("nextBtnC").disabled = false;
}



// -----------------------------------------------------
// 6) SAVE + NEXT QUESTION
// -----------------------------------------------------
async function finishQuestionC(index) {

    const q = questions[index];
    const isCorrect = (selectedAnswerC === q.correct);

    if (isCorrect) scoreC++;

    await fetch("http://localhost:8000/answer", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            test_id: localStorage.getItem("test_id_C"),
            question_id: q.id,
            selected_answer: selectedAnswerC,
            correct_answer: q.correct,
            is_correct: isCorrect,
            time_taken: 0
        })
    });

    const next = index + 1;

    if (next >= questions.length) {
        location.href = "?done=true";
    } else {
        const nextId = questions[next].id;
        location.href = `?q=${nextId}&mode=view`;
    }
}



// -----------------------------------------------------
// 7) PROGRESS BAR
// -----------------------------------------------------
function updateProgressC(i) {
    const bar = document.getElementById("progress");
    if (!bar) return;
    bar.style.width = (100 * i / questions.length) + "%";
}



// -----------------------------------------------------
// 8) RESULT SCREEN
// -----------------------------------------------------
async function showResultC() {

    await fetch("http://localhost:8000/finish", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            test_id: localStorage.getItem("test_id_C"),
            score: scoreC
        })
    });

    document.getElementById("app").innerHTML = `
        <div id="result-box">
            <h2>Test C abgeschlossen</h2>
            <p>Du hast <strong>${scoreC}</strong> von ${questions.length} Fragen richtig beantwortet.</p>

            <button class="back-home-btn"
                onclick="location.href='../feedback.html?test=C&tid=${localStorage.getItem("test_id_C")}'">
                Weiter zum Feedback
            </button>
        </div>
    `;
}
