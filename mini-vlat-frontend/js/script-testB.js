// =====================================================
// MINI-VLAT — Test B (Zeitdruck) FINAL STABLE (RENAMED)
// =====================================================

let timer = null;
let timeLeft = 25;

const API_BASE = "http://localhost:8000";

// neue states pro Seite
let questionStartMs = 0;
let hasAnswered = false;

// -----------------------------------------------------
// BACKEND START (einmalig pro Test)
// -----------------------------------------------------
async function ensureTestStartedB() {
    if (localStorage.getItem("test_id")) return;

    const response = await fetch(`${API_BASE}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            participantNumber: "auto",
            test_type: "B"
        })
    });

    if (!response.ok) {
        console.error("Failed to start test");
        return;
    }

    const data = await response.json();
    localStorage.setItem("test_id", data.test_id);

    localStorage.setItem("scoreB", "0");
    localStorage.setItem("totalTimeB", "0");
}

// -----------------------------------------------------
// TIME TAKEN
// -----------------------------------------------------
function getTimeTakenSecondsB() {
    const ms = Date.now() - questionStartMs;
    const s = ms / 1000;
    return Math.max(0, Math.min(25, s));
}

// -----------------------------------------------------
// RENDER TEST B QUESTION
// -----------------------------------------------------
async function renderTestB(qIndex) {

    if (qIndex === 0) {
        localStorage.removeItem("test_id");
        localStorage.setItem("scoreB", "0");
        localStorage.setItem("totalTimeB", "0");
    }

    await ensureTestStartedB();

    const q = questions[qIndex];
    timeLeft = 25;
    hasAnswered = false;
    questionStartMs = Date.now();

    const app = document.getElementById("app");

    app.innerHTML = `
    <div class="question-header">
      <div class="question-counter">
        Frage ${qIndex + 1} von ${questions.length}
      </div>

      <div id="circle-timer">
        <svg>
          <defs>
            <linearGradient id="timerGradientBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#3b6ff5"/>
              <stop offset="100%" stop-color="#2457d6"/>
            </linearGradient>
          </defs>
          <circle id="timer-bg" cx="35" cy="35" r="30"></circle>
          <circle id="timer-progress" cx="35" cy="35" r="30"></circle>
        </svg>
        <div id="time-text">${timeLeft}</div>
      </div>
    </div>

    <h2 class="prompt-text">${q.prompt}</h2>

    <div class="image-wrapper">
      <img src="${q.img}" class="vlat-image" alt="">
    </div>

    <ul class="answers">
      ${q.answers.map(a => `
        <li class="answer-option" onclick="selectAnswerTestB('${a}', ${qIndex})">
          ${a}
        </li>
      `).join("")}
    </ul>
    `;

    updateProgressB(qIndex);
    startTimerTestB(qIndex);
}

// -----------------------------------------------------
// TIMER
// -----------------------------------------------------
function startTimerTestB(qIndex) {
    clearInterval(timer);

    const timeText = document.getElementById("time-text");
    const progress = document.getElementById("timer-progress");

    const radius = 30;
    const circumference = 2 * Math.PI * radius;

    progress.style.strokeDasharray = circumference;
    progress.style.strokeDashoffset = 0;

    timer = setInterval(() => {
        timeLeft--;
        timeText.textContent = timeLeft;

        const offset = circumference - (timeLeft / 25) * circumference;
        progress.style.strokeDashoffset = offset;

        if (timeLeft <= 0) {
            clearInterval(timer);
            autoNextTestB(qIndex, true);
        }
    }, 1000);
}

// -----------------------------------------------------
// SAVE ANSWER
// -----------------------------------------------------
async function submitAnswerTestB(selectedAnswer, qIndex, timeTaken) {
    const q = questions[qIndex];
    const correct = selectedAnswer === q.correct;

    await fetch(`${API_BASE}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            test_id: localStorage.getItem("test_id"),
            question_id: q.id,
            selected_answer: selectedAnswer,
            correct_answer: q.correct,
            is_correct: correct,
            time_taken: timeTaken
        })
    });

    let score = Number(localStorage.getItem("scoreB")) || 0;
    let totalTime = Number(localStorage.getItem("totalTimeB")) || 0;

    if (correct) score++;
    totalTime += timeTaken;

    localStorage.setItem("scoreB", String(score));
    localStorage.setItem("totalTimeB", String(totalTime));
}

// -----------------------------------------------------
// ANSWER HANDLING
// -----------------------------------------------------
async function selectAnswerTestB(answer, qIndex) {
    if (hasAnswered) return;
    hasAnswered = true;

    clearInterval(timer);

    const q = questions[qIndex];
    const options = document.querySelectorAll(".answer-option");

    const timeTaken = getTimeTakenSecondsB();
    await submitAnswerTestB(answer, qIndex, timeTaken);

    // 1. richtige Antwort -> grün
    options.forEach(option => {
        const text = option.textContent.trim();

        if (text === q.correct) {
            option.classList.add("answer-correct");
        }
    });

    // 2. Falsche Antworten -> rot (außer No Answer)
    options.forEach(option => {
        const text = option.textContent.trim();

        if (text !== q.correct && text !== "No Answer") {
            option.classList.add("answer-wrong");
        }
    });

    // 3. Geklickte Antwort EXTRA-Rahmen geben
    options.forEach(option => {
        const text = option.textContent.trim();

        if (text === answer) {
            if (answer === q.correct) {
                option.classList.add("answer-correct-selected");  // grüner Rahmen
            } else if (answer !== "No Answer") {
                option.classList.add("answer-wrong-selected");    // roter Rahmen
            }
        }
    });

    // 4. deaktivieren
    options.forEach(option => {
        option.classList.add("disabled");
        option.style.pointerEvents = "none";
    });

    // 5. automatisch weiter
    setTimeout(() => {
        autoNextTestB(qIndex, false);
    }, 1200);
}



// -----------------------------------------------------
// NEXT QUESTION
// -----------------------------------------------------
async function autoNextTestB(qIndex, isTimeout) {

    if (isTimeout && !hasAnswered) {
        hasAnswered = true;
        await submitAnswerTestB("No Answer", qIndex, 25);
    }

    if (qIndex + 1 >= questions.length) {
        showResultTestB();
        return;
    }

    const next = questions[qIndex + 1];
    location.href = `q${qIndex + 2}_${next.id}.html`;
}

// -----------------------------------------------------
// PROGRESS BAR
// -----------------------------------------------------
function updateProgressB(i) {
    const progress = document.getElementById("progress");
    if (!progress) return;

    progress.style.width = `${(100 * i) / questions.length}%`;
}

// -----------------------------------------------------
// FINISH TEST (Backend)
// -----------------------------------------------------
async function showResultTestB() {

    const testId = localStorage.getItem("test_id");

    const response = await fetch(`${API_BASE}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test_id: testId })
    });

    const data = await response.json();

    const totalSeconds = Math.round(Number(data.total_time || 0));
    const score = Number(data.score || 0);

    document.getElementById("app").innerHTML = `
        <div class="card-screen">
            <h2>Test B abgeschlossen</h2>

            <p><strong>Score:</strong> ${score} / ${questions.length}</p>
            <p><strong>Gesamtzeit:</strong> ${totalSeconds} Sekunden</p>

            <button class="start-btn" id="feedbackBtn">
                Zum Feedback
            </button>
        </div>
    `;

    document.getElementById("feedbackBtn").addEventListener("click", () => {
        window.location.href = `../feedback.html?test_id=${testId}&test_type=B`;

    });
}