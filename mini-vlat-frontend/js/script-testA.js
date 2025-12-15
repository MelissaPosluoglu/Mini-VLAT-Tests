// =====================================================
// MINI-VLAT — Test A (Zeitdruck) FINAL STABLE
// =====================================================

// -----------------------------------------------------
// GLOBAL STATE
// -----------------------------------------------------
let timer = null;
let timeLeft = 25;

// AUTOMATISCH: localhost ODER VM
// const API_BASE = window.location.origin;
const API_BASE = "http://localhost:8000";


// -----------------------------------------------------
// BACKEND START (einmalig pro Test)
// -----------------------------------------------------
async function ensureTestStarted() {
    if (localStorage.getItem("test_id")) return;

    const response = await fetch(`${API_BASE}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            participantNumber: "auto",   // 🔥 Participant-Seite endgültig umgangen
            test_type: "A"
        })
    });

    if (!response.ok) {
        console.error("Failed to start test");
        return;
    }

    const data = await response.json();
    localStorage.setItem("test_id", data.test_id);
    localStorage.setItem("scoreA", "0");
    localStorage.setItem("totalTimeA", "0");
}

// -----------------------------------------------------
// RENDER TEST A QUESTION
// -----------------------------------------------------
async function renderTestA(qIndex) {

    await ensureTestStarted();

    const q = questions[qIndex];
    timeLeft = 25;

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
                <li class="answer-option"
                    onclick="selectAnswerTestA('${a}', ${qIndex})">
                    ${a}
                </li>
            `).join("")}
        </ul>
    `;

    updateProgress(qIndex);
    startTimerTestA(qIndex);
}

// -----------------------------------------------------
// TIMER
// -----------------------------------------------------
function startTimerTestA(qIndex) {
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

        const offset =
            circumference - (timeLeft / 25) * circumference;
        progress.style.strokeDashoffset = offset;

        if (timeLeft <= 0) {
            clearInterval(timer);
            autoNextTestA(qIndex);
        }
    }, 1000);
}


// -----------------------------------------------------
// ANSWER HANDLING
// -----------------------------------------------------
async function selectAnswerTestA(answer, qIndex) {

    clearInterval(timer);

    const q = questions[qIndex];
    const correct = answer === q.correct;

    let score = Number(localStorage.getItem("scoreA")) || 0;
    let totalTime = Number(localStorage.getItem("totalTimeA")) || 0;

    await fetch(`${API_BASE}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            test_id: localStorage.getItem("test_id"),
            question_id: q.id,
            selected_answer: answer,
            correct_answer: q.correct,
            is_correct: correct,
            time_taken: 25 - timeLeft
        })
    });

    if (correct) score++;
    totalTime += (25 - timeLeft);

    localStorage.setItem("scoreA", score);
    localStorage.setItem("totalTimeA", totalTime);

    autoNextTestA(qIndex);
}

// -----------------------------------------------------
// NEXT QUESTION
// -----------------------------------------------------
function autoNextTestA(qIndex) {

    if (qIndex + 1 >= questions.length) {
        showResultTestA();
        return;
    }

    const next = questions[qIndex + 1];
    location.href = `q${qIndex + 2}_${next.id}.html`;
}

// -----------------------------------------------------
// PROGRESS BAR
// -----------------------------------------------------
function updateProgress(i) {
    const progress = document.getElementById("progress");
    if (!progress) return;

    progress.style.width = `${(100 * i) / questions.length}%`;
}

// -----------------------------------------------------
// FINISH TEST
// -----------------------------------------------------
async function showResultTestA() {

    const testId = localStorage.getItem("test_id");
    const score = Number(localStorage.getItem("scoreA"));
    const totalTime = Number(localStorage.getItem("totalTimeA"));

    await fetch(`${API_BASE}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            test_id: testId,
            total_time: totalTime,
            score: score
        })
    });

    document.getElementById("app").innerHTML = `
        <div class="card-screen">
            <h2>Test A abgeschlossen</h2>

            <p><strong>Score:</strong> ${score} / ${questions.length}</p>
            <p><strong>Gesamtzeit:</strong> ${totalTime} Sekunden</p>

            <button class="start-btn" id="feedbackBtn">
                Zum Feedback
            </button>
        </div>
    `;

    document.getElementById("feedbackBtn").addEventListener("click", () => {
        window.location.href = `../feedback.html?test_id=${testId}&test_type=A`;
    });
}


