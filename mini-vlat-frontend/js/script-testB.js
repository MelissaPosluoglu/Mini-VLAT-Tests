// =====================================================
// MINI-VLAT — Test B (TIME PRESSURE + FEEDBACK)
// FINAL, STABLE VERSION (NEXT + 2s SOLUTION)
// =====================================================

let timer = null;
let timeLeft = 25;

let selectedAnswer = null ;
let showingSolution = false;

const API_BASE = window.location.origin;

// State variables per question
let questionStartMs = 0;
let hasAnswered = false;

// -----------------------------------------------------
// BACKEND INITIALIZATION (once per test)
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

    // Local tracking only (final values come from backend)
    localStorage.setItem("scoreB", "0");
    localStorage.setItem("totalTimeB", "0");
}

// -----------------------------------------------------
// TIME MEASUREMENT
// Counts only until NEXT click or timeout
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

    // Reset test state when starting from first question
    if (qIndex === 0) {
        localStorage.removeItem("test_id");
        localStorage.setItem("scoreB", "0");
        localStorage.setItem("totalTimeB", "0");
    }

    await ensureTestStartedB();

    const q = questions[qIndex];

    selectedAnswer = null ;
    timeLeft = 25;
    hasAnswered = false;
    showingSolution = false;
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
            onclick="selectAnswerTestB('${a}', ${qIndex})">
          ${a}
        </li>
      `).join("")}
    </ul>

    <button class="next-btn" id="nextBtn" disabled>Next</button>
    `;

    const nextBtn = document.getElementById("nextBtn");
    nextBtn.disabled = true;
    nextBtn.textContent = "Next";


    updateProgressB(qIndex);
    startTimerTestB(qIndex);

   document.getElementById("nextBtn").addEventListener("click", async () => {

    
    if (!hasAnswered && !showingSolution) {
        hasAnswered = true;
        clearInterval(timer);

        const timeTaken = getTimeTakenSecondsB();
        await submitAnswerTestB(selectedAnswer, qIndex, timeTaken);

        showSolutionThenNextB(qIndex);
        return;
    }

    
    if (showingSolution) {
        autoNextTestB(qIndex, false);
    }
});

}

// -----------------------------------------------------
// TIMER HANDLING
// -----------------------------------------------------
function startTimerTestB(qIndex) {
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

                await submitAnswerTestB("No Answer", qIndex, 25);

                showSolutionThenNextB(qIndex);
            }
        }
    }, 1000);
}

// -----------------------------------------------------
// SAVE ANSWER (backend is single source of truth)
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

    // Local tracking only
    let score = Number(localStorage.getItem("scoreB")) || 0;
    let totalTime = Number(localStorage.getItem("totalTimeB")) || 0;

    if (correct) score++;
    totalTime += timeTaken;

    localStorage.setItem("scoreB", String(score));
    localStorage.setItem("totalTimeB", String(totalTime));
}

// -----------------------------------------------------
// ANSWER SELECTION (visual only, no saving yet)
// -----------------------------------------------------
function selectAnswerTestB(answer, qIndex) {
    if (hasAnswered || showingSolution) return;

    selectedAnswer = answer;

    document.querySelectorAll(".answer-option").forEach(li => {
        li.classList.toggle("selected", li.textContent.trim() === answer);
    });
    document.getElementById("nextBtn").disabled = false;
}

// -----------------------------------------------------
// SHOW SOLUTION FOR 2 SECONDS, THEN CONTINUE
// (Solution display does NOT count towards time)
// -----------------------------------------------------
function showSolutionThenNextB(qIndex) {
    const q = questions[qIndex];
    const options = document.querySelectorAll(".answer-option");

    showingSolution = true;

    options.forEach(option => {
        option.classList.add("disabled");
        option.style.pointerEvents = "none";
    });

    options.forEach(option => {
        const text = option.textContent.trim();
        if (text === q.correct) option.classList.add("answer-correct");
        else if (text !== "No Answer") option.classList.add("answer-wrong");
    });

    options.forEach(option => {
        const text = option.textContent.trim();
        if (text === selectedAnswer) {
            if (selectedAnswer === q.correct)
                option.classList.add("answer-correct-selected");
            else if (selectedAnswer !== "No Answer")
                option.classList.add("answer-wrong-selected");
        }
    });

    
    const nextBtn = document.getElementById("nextBtn");
    nextBtn.disabled = false;
    nextBtn.textContent = "Next";
}


// -----------------------------------------------------
// NAVIGATION TO NEXT QUESTION
// -----------------------------------------------------
async function autoNextTestB(qIndex, isTimeout) {
    
    if (qIndex + 1 >= questions.length) {
        showResultTestB();
        return;
    }

    const next = questions[qIndex + 1];
    location.href = `q${qIndex + 2}_${next.id}.html`;
}

// -----------------------------------------------------
// PROGRESS BAR UPDATE
// -----------------------------------------------------
function updateProgressB(i) {
    const progress = document.getElementById("progress");
    if (!progress) return;

    progress.style.width = `${(100 * i) / questions.length}%`;
}

// -----------------------------------------------------
// FINAL RESULT SCREEN (backend truth)
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
            <h2>Test B completed</h2>

            <p><strong>Score:</strong> ${score} / ${questions.length}</p>
            <p><strong>Total time:</strong> ${totalSeconds} seconds</p>

            <button class="start-btn" id="feedbackBtn">
                Go to Results
            </button>
        </div>
    `;

    document.getElementById("feedbackBtn").addEventListener("click", () => {
    const basePath = window.location.pathname.split("/questionsB/")[0];
    window.location.href = basePath + "/results.html";
});

}
