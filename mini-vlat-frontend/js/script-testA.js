// =====================================================
// MINI-VLAT — Test A (Zeitdruck) – FINAL STABLE VERSION
// =====================================================

// -----------------------------------------------------
// STATE (für Fragen-Seiten)
// -----------------------------------------------------
let score = 0;
let timer = null;
let timeLeft = 25;

let totalTimeA = Number(localStorage.getItem("totalTimeA")) || 0;

// -----------------------------------------------------
// 1) STARTSCREEN LOGIK — läuft NUR in testA.html
// -----------------------------------------------------
if (location.pathname.endsWith("testA.html")) {

    document.addEventListener("DOMContentLoaded", () => {

        const numberScreen = document.getElementById("number-input-screen");
        const intro = document.getElementById("testA-intro");

        // Wenn noch keine Nummer → Eingabe anzeigen
        if (!localStorage.getItem("participantNumber")) {
            numberScreen.style.display = "block";
            return;
        }

        // Wenn Nummer existiert → Intro anzeigen
        intro.style.display = "block";
    });

    // Nummer speichern
    document.getElementById("startNumberBtn")?.addEventListener("click", () => {
        const number = document.getElementById("participantNumber").value.trim();
        if (!number) return alert("Bitte gültige Nummer eingeben.");

        localStorage.setItem("participantNumber", number);

        document.getElementById("number-input-screen").style.display = "none";
        document.getElementById("testA-intro").style.display = "block";
    });

    // Test starten
    document.getElementById("startTestA")?.addEventListener("click", async () => {

        score = 0;

        const response = await fetch("http://localhost:8000/start", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                participantNumber: localStorage.getItem("participantNumber"),
                test_type: "A"
            })
        });

        const data = await response.json();
        localStorage.setItem("test_id", data.test_id);
        localStorage.setItem("scoreA", 0);

        // zur ersten Frage gehen
        location.href = "./questions/q1_treemap.html";
    });
}



// -----------------------------------------------------
// 2) FRAGE-RENDERING (läuft auf question-Seiten)
// -----------------------------------------------------
function renderTestA(qIndex) {

    const q = questions[qIndex];
    timeLeft = 25;

    updateProgress(qIndex);

    document.getElementById("app").innerHTML = `
        <div class="question-header">
            <div id="question-counter">Frage ${qIndex + 1} von ${questions.length}</div>
            <div id="timer-box"></div>
        </div>

        <h2 class="prompt-text">${q.prompt}</h2>

        <div class="image-wrapper">
            <img src="${q.img}" class="vlat-image">
        </div>

        <ul class="answers">
            ${q.answers.map(a =>
        `<li class="answer-option" onclick="selectAnswerTestA('${a}', ${qIndex})">${a}</li>`
    ).join("")}
        </ul>
    `;

    startTimerTestA(qIndex);
}



// -----------------------------------------------------
// 3) TIMER
// -----------------------------------------------------
function startTimerTestA(qIndex) {

    clearInterval(timer);
    timeLeft = 25;

    const radius = 25;
    const circumference = 2 * Math.PI * radius;

    document.getElementById("timer-box").innerHTML = `
        <div id="circle-timer">
            <svg>
                <defs>
                    <linearGradient id="timerGradientBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#3b6ff5"/>
                        <stop offset="100%" stop-color="#2457d6"/>
                    </linearGradient>
                </defs>

                <circle id="timer-bg" cx="35" cy="35" r="${radius}"></circle>
                <circle id="timer-progress"
                    cx="35" cy="35" r="${radius}"
                    style="stroke-dasharray:${circumference}; stroke-dashoffset:0;">
                </circle>
            </svg>

            <span id="time-text">${timeLeft}</span>
        </div>
    `;

    const progress = document.getElementById("timer-progress");
    const timeText = document.getElementById("time-text");
    const offsetStep = circumference / 25;

    timer = setInterval(() => {
        timeLeft--;
        timeText.textContent = timeLeft;

        progress.style.strokeDashoffset = offsetStep * (25 - timeLeft);

        if (timeLeft <= 0) {
            clearInterval(timer);
            autoNextTestA(qIndex);
        }
    }, 1000);
}



// -----------------------------------------------------
// 4) ANSWER SPEICHERN
// -----------------------------------------------------
async function selectAnswerTestA(answer, qIndex) {

    const q = questions[qIndex];
    const correct = (answer === q.correct);

    let currentScore = Number(localStorage.getItem("scoreA")) || 0;

    await fetch("http://localhost:8000/answer", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            test_id: localStorage.getItem("test_id"),
            question_id: q.id,
            selected_answer: answer,
            correct_answer: q.correct,
            time_taken: 25 - timeLeft,
            is_correct: correct
        })
    });

    totalTimeA += (25 - timeLeft);
    localStorage.setItem("totalTimeA", totalTimeA);

    if (correct) {
        currentScore++;
        localStorage.setItem("scoreA", currentScore);
    }

    autoNextTestA(qIndex);
}



// -----------------------------------------------------
// 5) AUTO NEXT
// -----------------------------------------------------
function autoNextTestA(qIndex) {

    // Letzte Frage → Feedback
    if (qIndex + 1 >= questions.length) {
        showResultTestA();
        return;
    }

    const nextId = questions[qIndex + 1].id;
    const nextNumber = qIndex + 2;

    location.href = `q${nextNumber}_${nextId}.html`;
}



// -----------------------------------------------------
// 6) PROGRESS BAR
// -----------------------------------------------------
function updateProgress(i) {
    document.getElementById("progress").style.width =
        (100 * i / questions.length) + "%";
}



// -----------------------------------------------------
// 7) RESULT PAGE
// -----------------------------------------------------
async function showResultTestA() {

    const finalScore = Number(localStorage.getItem("scoreA")) || 0;
    const finalTime = Number(localStorage.getItem("totalTimeA")) || 0;

    await fetch("http://localhost:8000/finish", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            test_id: localStorage.getItem("test_id"),
            total_time: finalTime,
            score: finalScore
        })
    });

    document.getElementById("app").innerHTML = `
        <div id="result-box">
            <h2>Test abgeschlossen</h2>
            <p>Du hast <strong>${finalScore}</strong> von ${questions.length} Fragen richtig beantwortet.</p>

            <button class="back-home-btn"
                onclick="location.href='../feedback.html?test=A&tid=${localStorage.getItem("test_id")}'">
                Weiter zum Feedback
            </button>
        </div>
    `;

    localStorage.removeItem("scoreA");
    localStorage.removeItem("totalTimeA");

}
