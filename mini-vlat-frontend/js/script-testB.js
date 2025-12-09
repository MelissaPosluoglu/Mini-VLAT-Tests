// =====================================================
// MINI-VLAT — Test B (Feedback-Version) – FINAL STABLE
// =====================================================

// -----------------------------------------------------
// STATE
// -----------------------------------------------------
let scoreB = 0;
let selectedAnswerB = "No Answer";


// -----------------------------------------------------
// 1) STARTSCREEN LOGIK — läuft NUR in testB.html
// -----------------------------------------------------
if (location.pathname.endsWith("testB.html")) {

    document.addEventListener("DOMContentLoaded", () => {

        const numberScreen = document.getElementById("number-input-screen");
        const intro = document.getElementById("testB-intro");

        // Keine Nummer → Eingabe
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
        document.getElementById("testB-intro").style.display = "block";
    });

    // Test B starten
    document.getElementById("startTestB")?.addEventListener("click", async () => {

        scoreB = 0;

        const response = await fetch("http://localhost:8000/start", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                participantNumber: localStorage.getItem("participantNumber"),
                test_type: "B"
            })
        });

        const data = await response.json();
        localStorage.setItem("test_id_B", data.test_id);

        // zur ersten Frage
        location.href = "./questions/q1_treemap.html";
    });
}



// -----------------------------------------------------
// 2) FRAGE-RENDERING — läuft nur auf question-Seiten
// -----------------------------------------------------
function renderTestB(qIndex) {

    const q = questions[qIndex];
    selectedAnswerB = "No Answer";

    updateProgressB(qIndex);

    document.getElementById("app").innerHTML = `
        <div class="question-header">
            <div id="question-counter">Frage ${qIndex + 1} von ${questions.length}</div>
        </div>

        <h2 class="prompt-text">${q.prompt}</h2>

        <img src="${q.img}" class="vlat-image">

        <ul class="answers">
            ${q.answers
        .map(a => `
                    <li onclick="selectAnswerB('${a}', ${qIndex})"
                        class="${a === 'No Answer' ? 'selected' : ''}">
                        ${a}
                    </li>
            `).join("")}
        </ul>

        <div id="feedback" class="feedback-box"></div>

        <button id="nextBtnB" class="next-btn" disabled>Weiter</button>
    `;

    document.getElementById("nextBtnB").onclick = () => nextQuestionB(qIndex);
}



// -----------------------------------------------------
// 3) AUF ANTWORT KLICK
// -----------------------------------------------------
async function selectAnswerB(answer, qIndex) {

    const correct = questions[qIndex].correct;
    const lis = document.querySelectorAll(".answers li");

    // alles resetten
    lis.forEach(li => li.classList.remove(
        "selected", "answer-correct", "answer-wrong", "answer-selected"
    ));

    selectedAnswerB = answer;

    // ----------- No Answer (immer falsch) -----------
    if (answer === "No Answer") {

        document.querySelector(".answers li:last-child").classList.add("selected");

        await logAnswerB(qIndex, "No Answer", correct, false);

        document.getElementById("feedback").innerHTML = "Keine Antwort ausgewählt.";
        document.getElementById("feedback").className = "feedback-box neutral";

        document.getElementById("nextBtnB").disabled = false;
        return;
    }

    // ----------- reguläre Antwort speichern -----------
    const isCorrect = (answer === correct);
    if (isCorrect) scoreB++;

    await logAnswerB(qIndex, answer, correct, isCorrect);

    // ----------- visuelles Feedback -----------
    lis.forEach(li => {
        if (li.innerText === answer) li.classList.add("answer-selected");
    });

    if (isCorrect) {

        lis.forEach(li => {
            if (li.innerText === correct) li.classList.add("answer-correct");
        });

        document.getElementById("feedback").innerHTML = "✔ Correct!";
        document.getElementById("feedback").className = "feedback-box correct";

    } else {

        lis.forEach(li => {
            if (li.innerText !== correct) li.classList.add("answer-wrong");
        });
        lis.forEach(li => {
            if (li.innerText === correct) li.classList.add("answer-correct");
        });

        document.getElementById("feedback").innerHTML =
            `✖ Incorrect<br>Correct answer: <strong>${correct}</strong>`;
        document.getElementById("feedback").className = "feedback-box incorrect";
    }

    document.getElementById("nextBtnB").disabled = false;
}



// -----------------------------------------------------
// 4) BACKEND LOGGING
// -----------------------------------------------------
async function logAnswerB(qIndex, answer, correct, isCorrect) {

    await fetch("http://localhost:8000/answer", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            test_id: localStorage.getItem("test_id_B"),
            question_id: questions[qIndex].id,
            selected_answer: answer,
            correct_answer: correct,
            is_correct: isCorrect,
            time_taken: 0
        })
    });
}



// -----------------------------------------------------
// 5) NÄCHSTE FRAGE
// -----------------------------------------------------
async function nextQuestionB(qIndex) {

    const next = qIndex + 1;

    if (next >= questions.length) {

        await fetch("http://localhost:8000/finish", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                test_id: localStorage.getItem("test_id_B"),
                total_time: 0,
                score: scoreB
            })
        });

        location.href = "../feedback.html?test=B&tid=" + localStorage.getItem("test_id_B");
        return;
    }

    const nextId = questions[next].id;
    const nextNumber = next + 1;

    location.href = `q${nextNumber}_${nextId}.html`;
}



// -----------------------------------------------------
// 6) PROGRESSBAR
// -----------------------------------------------------
function updateProgressB(i) {
    const bar = document.getElementById("progress");
    if (bar) bar.style.width = (100 * i / questions.length) + "%";
}



// -----------------------------------------------------
// 7) OPTIONAL – RESULT SCREEN VIA ?done=true
// -----------------------------------------------------
async function showResultB() {

    const id = localStorage.getItem("test_id_B");
    const res = await fetch(`http://localhost:8000/results/B`);
    const list = await res.json();

    const my = list.find(x => x._id === id);
    const finalScore = my?.score ?? 0;

    document.getElementById("app").innerHTML = `
        <h2>Finished!</h2>
        <p>You got <strong>${finalScore}</strong> out of ${questions.length} correct.</p>

        <button class="back-home-btn"
            onclick="location.href='../feedback.html?test=B&tid=${id}'">
            Weiter zum Feedback
        </button>
    `;
}
