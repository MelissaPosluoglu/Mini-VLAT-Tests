// =====================================================
// MINI-VLAT — Test D
// IDENTICAL TO TEST C, BUT:
// - No visible timer
// - No solution feedback
// - Manual navigation only
// =====================================================

let selectedAnswer = null;
let questionStartMs = 0;
let hasAnswered = false;

const API_BASE = "http://localhost:8000";

// -----------------------------------------------------
// BACKEND INITIALIZATION
// -----------------------------------------------------
async function ensureTestStartedD() {
    if (localStorage.getItem("test_id")) return;

    const response = await fetch(`${API_BASE}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            participantNumber: localStorage.getItem("participantNumber") || "auto",
            test_type: "D"
        })
    });

    const data = await response.json();
    localStorage.setItem("test_id", data.test_id);
}

// -----------------------------------------------------
// TIME MEASUREMENT (same as Test C, no time pressure)
// -----------------------------------------------------
function getTimeTakenSecondsD() {
    return (Date.now() - questionStartMs) / 1000;
}

// -----------------------------------------------------
// RENDER QUESTION
// -----------------------------------------------------
async function renderTestD(qIndex) {

    // Reset test state when starting from first question
    if (qIndex === 0) {
        localStorage.removeItem("test_id");
    }

    await ensureTestStartedD();

    const q = questions[qIndex];
    selectedAnswer = null;
    hasAnswered = false;
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
                    onclick="selectAnswerTestD('${a}')">${a}</li>
            `).join("")}
        </ul>

        <button class="next-btn" id="nextBtn" disabled>Next</button>
    `;

    updateProgressD(qIndex);

    document.getElementById("nextBtn").onclick = async () => {
        if (hasAnswered) return;
        hasAnswered = true;

        const timeTaken = getTimeTakenSecondsD();
        await submitAnswerTestD(qIndex, timeTaken);

        goNextD(qIndex);
    };
}

// -----------------------------------------------------
// ANSWER SELECTION
// -----------------------------------------------------
function selectAnswerTestD(answer) {
    if (hasAnswered) return;

    selectedAnswer = answer;

    document.querySelectorAll(".answer-option").forEach(li => {
        li.classList.toggle("selected", li.innerText.trim() === answer);
    });
    document.getElementById("nextBtn").disabled = false;
}

// -----------------------------------------------------
// SAVE ANSWER (backend is single source of truth)
// -----------------------------------------------------
async function submitAnswerTestD(qIndex, timeTaken) {

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
// NAVIGATION TO NEXT QUESTION
// -----------------------------------------------------
function goNextD(qIndex) {
    if (qIndex + 1 >= questions.length) {
        showResultTestD();
        return;
    }

    const next = questions[qIndex + 1];
    location.href = "q" + (qIndex + 2) + "_" + next.id + ".html";
}

// -----------------------------------------------------
// PROGRESS BAR UPDATE 
// -----------------------------------------------------
function updateProgressD(i) {
    const bar = document.getElementById("progress");
    if (!bar) return;
    bar.style.width = (100 * i / questions.length) + "%";
}

// -----------------------------------------------------
// FINAL RESULT SCREEN (no feedback shown during test)
// -----------------------------------------------------
async function showResultTestD() {

    const testId = localStorage.getItem("test_id");

    const response = await fetch(`${API_BASE}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test_id: testId })
    });

    const data = await response.json();

    document.getElementById("app").innerHTML = `
        <div class="card-screen">
            <h2>Test D completed</h2>
            <p><strong>Score:</strong> ${data.score} / ${questions.length}</p>
            <p><strong>Total time:</strong> ${Math.round(data.total_time)} seconds</p>
            <button class="start-btn" id="feedbackBtn">Go to Feedback</button>
        </div>
    `;

    document.getElementById("feedbackBtn").onclick = () => {
        location.href = "../feedback.html?test_id=" + testId + "&test_type=D";
    };
}
