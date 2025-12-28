// =====================================================
// MINI-VLAT — Test C
// IDENTICAL TO TEST B (NO VISIBLE TIMER)
// - Solution feedback shown
// - Auto-advance after 2 seconds
// - OR manual navigation via button
// =====================================================

let selectedAnswer = null;
let questionStartMs = 0;
let hasAnswered = false;
let showingSolution = false;
let autoNextTimeout = null;

const API_BASE = "http://localhost:8000";

// -----------------------------------------------------
// BACKEND INITIALIZATION
// -----------------------------------------------------
async function ensureTestStartedC() {
    if (localStorage.getItem("test_id")) return;

    const response = await fetch(`${API_BASE}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            participantNumber: localStorage.getItem("participantNumber") || "auto",
            test_type: "C"
        })
    });

    const data = await response.json();
    localStorage.setItem("test_id", data.test_id);
}

// -----------------------------------------------------
// TIME MEASUREMENT (no time pressure)
// -----------------------------------------------------
function getTimeTakenSecondsC() {
    return (Date.now() - questionStartMs) / 1000;
}

// -----------------------------------------------------
// RENDER QUESTION
// -----------------------------------------------------
async function renderTestC(qIndex) {

    // Reset test state when starting from first question
    if (qIndex === 0) {
        localStorage.removeItem("test_id");
    }

    await ensureTestStartedC();

    const q = questions[qIndex];
    selectedAnswer = null;
    hasAnswered = false;
    showingSolution = false;
    questionStartMs = Date.now();

    document.getElementById("app").innerHTML = `
        <div class="question-header">
            <div class="question-counter">
                Question ${qIndex + 1} of ${questions.length}
            </div>
        </div>

        <h2 class="prompt-text">${q.prompt}</h2>

        <div class="image-wrapper">
            <img src="${q.img}" class="vlat-image">
        </div>

        <ul class="answers">
            ${q.answers.map(a => `
                <li class="answer-option"
                    onclick="selectAnswerTestC('${a}')">${a}</li>
            `).join("")}
        </ul>

        <button class="next-btn" id="nextBtn" disabled>Next</button>
    `;

    updateProgressC(qIndex);

    document.getElementById("nextBtn").onclick = async () => {

        // If solution is already shown → immediately continue
        if (showingSolution) {
            clearTimeout(autoNextTimeout);
            goNextC(qIndex);
            return;
        }

        hasAnswered = true;

        const timeTaken = getTimeTakenSecondsC();
        await submitAnswerTestC(qIndex, timeTaken);

        showSolutionC(qIndex);
    };
}

// -----------------------------------------------------
// ANSWER SELECTION
// -----------------------------------------------------
function selectAnswerTestC(answer) {
    if (hasAnswered || showingSolution) return;

    selectedAnswer = answer;

    document.querySelectorAll(".answer-option").forEach(li => {
        li.classList.toggle("selected", li.innerText.trim() === answer);
    });

    document.getElementById("nextBtn").disabled = false;
}

// -----------------------------------------------------
// SAVE ANSWER (backend is source of truth)
// -----------------------------------------------------
async function submitAnswerTestC(qIndex, timeTaken) {

    const q = questions[qIndex];
    const correct = selectedAnswer === q.correct;

    await fetch(`${API_BASE}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            test_id: localStorage.getItem("test_id"),
            question_id: q.id,
            selected_answer: selectedAnswer || "No Answer",
            correct_answer: q.correct,
            is_correct: correct,
            time_taken: timeTaken
        })
    });
}

// -----------------------------------------------------
// SHOW SOLUTION + AUTO-NEXT
// -----------------------------------------------------
function showSolutionC(qIndex) {

    const q = questions[qIndex];
    const options = document.querySelectorAll(".answer-option");

    showingSolution = true;

    // Disable interaction during solution display
    options.forEach(option => {
        option.classList.remove("selected");
        option.classList.add("disabled");
        option.style.pointerEvents = "none";
    });

    // Highlight correct answer
    options.forEach(option => {
        if (option.innerText.trim() === q.correct) {
            option.classList.add("answer-correct");
        }
    });

    // Highlight incorrect answers
    options.forEach(option => {
        const text = option.innerText.trim();
        if (text !== q.correct && text !== "No Answer") {
            option.classList.add("answer-wrong");
        }
    });

    // Highlight selected answer
    options.forEach(option => {
        if (option.innerText.trim() === selectedAnswer) {
            if (selectedAnswer === q.correct) {
                option.classList.add("answer-correct-selected");
            } else if (selectedAnswer !== "No Answer") {
                option.classList.add("answer-wrong-selected");
            }
        }
    });

    const btn = document.getElementById("nextBtn");
    btn.innerText = "Next";
    btn.disabled = false;

    // Auto-advance after 2 seconds (same behavior as Test B)
    autoNextTimeout = setTimeout(() => {
        goNextC(qIndex);
    }, 2000);
}

// -----------------------------------------------------
// NAVIGATION TO NEXT QUESTION
// -----------------------------------------------------
function goNextC(qIndex) {
    if (qIndex + 1 >= questions.length) {
        showResultTestC();
        return;
    }

    const next = questions[qIndex + 1];
    location.href = "q" + (qIndex + 2) + "_" + next.id + ".html";
}

// -----------------------------------------------------
// PROGRESS BAR UPDATE
// -----------------------------------------------------
function updateProgressC(i) {
    const bar = document.getElementById("progress");
    if (!bar) return;
    bar.style.width = (100 * i / questions.length) + "%";
}

// -----------------------------------------------------
// FINAL RESULT SCREEN
// -----------------------------------------------------
async function showResultTestC() {

    const testId = localStorage.getItem("test_id");

    const response = await fetch(`${API_BASE}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test_id: testId })
    });

    const data = await response.json();

    document.getElementById("app").innerHTML = `
        <div class="card-screen">
            <h2>Test C completed</h2>
            <p><strong>Score:</strong> ${data.score} / ${questions.length}</p>
            <p><strong>Total time:</strong> ${Math.round(data.total_time)} seconds</p>
            <button class="start-btn" id="feedbackBtn">Go to Feedback</button>
        </div>
    `;

    document.getElementById("feedbackBtn").onclick = () => {
        location.href = "../feedback.html?test_id=" + testId + "&test_type=C";
    };
}
