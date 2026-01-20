// =====================================================
// MINI-VLAT — Test A (TIME PRESSURE)
// FINAL, STABLE VERSION (FIXED)
// =====================================================
let timer = null;
let timeLeft = 25;
let selectedAnswer = null ;

const API_BASE = "http://localhost:8000";

// State variables per question
let questionStartMs = 0;
let hasAnswered = false;

// -----------------------------------------------------
// BACKEND INITIALIZATION (once per test)
// -----------------------------------------------------
async function ensureTestStarted() {
    if (localStorage.getItem("test_id")) return;

    const response = await fetch(`${API_BASE}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            participantNumber: "auto",
            test_type: "A"
        })
    });

    if (!response.ok) {
        console.error("Failed to start test");
        return;
    }

    const data = await response.json();
    localStorage.setItem("test_id", data.test_id);

    // Local tracking only for display/debugging
    // Final results are computed by the backend
    localStorage.setItem("scoreA", "0");
    localStorage.setItem("totalTimeA", "0");
}


// -----------------------------------------------------
// TIME MEASUREMENT
// Uses real wall-clock time, not timer ticks
// -----------------------------------------------------
function getTimeTakenSeconds() {
    const ms = Date.now() - questionStartMs;
    const s = ms / 1000;
    return Math.max(0, Math.min(25, s));
}

// -----------------------------------------------------
// RENDER TEST A QUESTION
// -----------------------------------------------------
async function renderTestA(qIndex) {

    // Reset test state when starting from the first question
    if (qIndex === 0) {
        localStorage.removeItem("test_id");
        localStorage.setItem("scoreA", "0");
        localStorage.setItem("totalTimeA", "0");
    }

    await ensureTestStarted();

    const q = questions[qIndex];

    selectedAnswer = null;
    timeLeft = 25;
    hasAnswered = false;
    questionStartMs = Date.now();

    const app = document.getElementById("app");

    app.innerHTML = `
    <div class="question-header">
      <div class="question-counter">
        Question ${qIndex + 1} of ${questions.length}
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
        <li class="answer-option ${a === selectedAnswer ? "selected" : ""}"
            onclick="selectAnswerTestA('${a}', ${qIndex})">
          ${a}
        </li>
      `).join("")}
    </ul>

    <button class="next-btn" id="nextBtn" disabled>Next</button>
    `;

    updateProgress(qIndex);
    startTimerTestA(qIndex);

    document.getElementById("nextBtn").addEventListener("click", async () => {
        if (hasAnswered) return;
        hasAnswered = true;

        clearInterval(timer);

        // Disable further interaction
        document.querySelectorAll(".answer-option").forEach(li => {
            li.style.pointerEvents = "none";
        });

        const timeTaken = getTimeTakenSeconds();
        await submitAnswerTestA(selectedAnswer, qIndex, timeTaken);

        autoNextTestA(qIndex, false);
    });
}


// -----------------------------------------------------
// TIMER HANDLING
// -----------------------------------------------------
async function startTimerTestA(qIndex) {
    clearInterval(timer);

    const timeText = document.getElementById("time-text");
    const progress = document.getElementById("timer-progress");

    const radius = 30;
    const circumference = 2 * Math.PI * radius;

    progress.style.strokeDasharray = circumference;
    progress.style.strokeDashoffset = 0;

    timer = setInterval(async () => {
        timeLeft--;
        timeText.textContent = timeLeft;

        const offset = circumference - (timeLeft / 25) * circumference;
        progress.style.strokeDashoffset = offset;

        if (timeLeft <= 0) {
            clearInterval(timer);

            if (!hasAnswered) {
                hasAnswered = true;

                document.querySelectorAll(".answer-option").forEach(li => {
                    li.style.pointerEvents = "none";
                });

                await submitAnswerTestA("No Answer", qIndex, 25);
            }

            autoNextTestA(qIndex, true);
        }
    }, 1000);
}



// -----------------------------------------------------
// SAVE ANSWER (single source of truth = backend)
// -----------------------------------------------------
async function submitAnswerTestA(selectedAnswer, qIndex, timeTaken) {
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

    // Local tracking (not authoritative)
    let score = Number(localStorage.getItem("scoreA")) || 0;
    let totalTime = Number(localStorage.getItem("totalTimeA")) || 0;

    if (correct) score++;
    totalTime += timeTaken;

    localStorage.setItem("scoreA", String(score));
    localStorage.setItem("totalTimeA", String(totalTime));
}

// -----------------------------------------------------
// ANSWER HANDLING (click)
// -----------------------------------------------------
function selectAnswerTestA(answer, qIndex) {
    if (hasAnswered) return;

    selectedAnswer = answer;

    document.querySelectorAll(".answer-option").forEach(li => {
        li.classList.toggle("selected", li.textContent.trim() === answer);
    });
        document.getElementById("nextBtn").disabled = false;
}

// -----------------------------------------------------
// NAVIGATION TO NEXT QUESTION
// -----------------------------------------------------
async function autoNextTestA(qIndex, isTimeout) {

    // If timeout occurred and no answer was saved yet
    if (isTimeout && !hasAnswered) {
        hasAnswered = true;
        await submitAnswerTestA("No Answer", qIndex, 25);
    }

    if (qIndex + 1 >= questions.length) {
        showResultTestA();
        return;
    }

    const next = questions[qIndex + 1];
    location.href = `q${qIndex + 2}_${next.id}.html`;
}

// -----------------------------------------------------
// PROGRESS BAR UPDATE
// -----------------------------------------------------
function updateProgress(i) {
    const progress = document.getElementById("progress");
    if (!progress) return;

    progress.style.width = `${(100 * i) / questions.length}%`;
}


// -----------------------------------------------------
// FINAL RESULT SCREEN (backend truth)
// -----------------------------------------------------
async function showResultTestA() {

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
            <h2>Test A completed</h2>

            <p><strong>Score:</strong> ${score} / ${questions.length}</p>
            <p><strong>Total time:</strong> ${totalSeconds} seconds</p>

            <button class="start-btn" id="feedbackBtn">
                Go to Results
            </button>
        </div>
    `;

    document.getElementById("feedbackBtn").addEventListener("click", () => {
    const basePath = window.location.pathname.split("/questionsA/")[0];
    window.location.href = basePath + "/results.html";
});

}
