// =====================================================
// MINI-VLAT — Test C (Two-Step Interaction)
// Participants first view the visualization only,
// then switch to an answer-selection view.
// No time pressure and no immediate feedback.
// =====================================================


// ------------------------------
// QUESTION SET (IDENTICAL DATASET)
// Shared question set across all test conditions
// ------------------------------

const questions = [
    { id:"treemap", prompt:"eBay is nested in the Software category. True or false?", img:"https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/treemap.png", answers:["True","False"], correct:"False" },
    { id:"histogram", prompt:"What distance have customers traveled the most?", img:"https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/histogram.png", answers:["20–30 km","50–60 km","60–70 km","30–40 km"], correct:"30–40 km" },
    { id:"100stacked", prompt:"Which country has the lowest proportion of Gold medals?", img:"https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/100stackedbar.png", answers:["U.S.A.","Great Britain","Japan","Australia"], correct:"Japan" },
    { id:"map", prompt:"In 2020, WA had a higher unemployment rate than WI. True or false?", img:"https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/map.png", answers:["True","False"], correct:"True" },
    { id:"pie", prompt:"What is Samsung's global smartphone market share?", img:"https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/pie.png", answers:["10.9%","17.6%","25.3%","35.2%"], correct:"25.3%" },
    { id:"bubble", prompt:"Which has the largest number of metro stations?", img:"https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/bubble.png", answers:["Beijing","Shanghai","London","Seoul"], correct:"Shanghai" },
    { id:"stackedbar", prompt:"What is the cost of peanuts in Seoul?", img:"https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/stackedbar.png", answers:["$7.5","$6.1","$5.2","$4.5"], correct:"$6.1" },
    { id:"line", prompt:"What was the price of a barrel of oil in February 2020?", img:"https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/line.png", answers:["$50.54","$42.34","$47.02","$43.48"], correct:"$50.54" },
    { id:"bar", prompt:"What is the average internet speed in Japan?", img:"https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/bar.png", answers:["40.51 Mbps","16.16 Mbps","35.25 Mbps","42.30 Mbps"], correct:"40.51 Mbps" },
    { id:"area", prompt:"What was the average price of coffee in October 2019?", img:"https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/area.png", answers:["$0.71","$0.63","$0.80","$0.90"], correct:"$0.80" },
    { id:"stackedarea", prompt:"Girls named Isla to Amelia ratio?", img:"https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/stackedarea.png", answers:["1 to 1","1 to 2","1 to 3","1 to 4"], correct:"1 to 4" },
    { id:"scatter", prompt:"Negative relationship between height & weight?", img:"https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/scatterplot.png", answers:["True","False"], correct:"False" }
];

// ------------------------------
// GLOBAL STATE
// Stores the current score and selected answer
// ------------------------------

let score = 0;              // Number of correct answers
let selectedAnswer = null;  // Currently selected answer

// ------------------------------
// URL STATE HANDLING
// Determines the current question and interaction mode
// (view mode or answer mode) based on URL parameters
// ------------------------------

function getStateFromURL() {
    const params = new URLSearchParams(location.search);

    // Test finished → show result page
    if (params.get("done") === "true") {
        showResult();
        return null;
    }

    const id = params.get("q");
    const mode = params.get("mode") || "view";

    // Determine question index by ID
    const index = questions.findIndex(q => q.id === id);

    return { index: index === -1 ? 0 : index, mode };
}

// ------------------------------
// RENDER VIEW MODE
// Displays only the visualization and the question
// Participants must switch to answer mode manually
// ------------------------------

function renderViewMode(qIndex) {
    const q = questions[qIndex];

    updateProgress(qIndex);

    document.getElementById("app").innerHTML = `
        <h2>${q.prompt}</h2>
        <img src="${q.img}">
        <button onclick="goToAnswerMode('${q.id}')">Weiter</button>
    `;
}

// ------------------------------
// RENDER ANSWER MODE
// Displays answer options and allows selection
// ------------------------------------------------

function renderAnswerMode(qIndex) {
    const q = questions[qIndex];
    selectedAnswer = null;

    updateProgress(qIndex);

    document.getElementById("app").innerHTML = `
        <h2>${q.prompt}</h2>

        <ul class="answers">
            ${q.answers.map(a => `<li onclick="selectAnswer('${a}')">${a}</li>`).join("")}
        </ul>

        <button onclick="goBackToView('${q.id}')">Zurück zur Grafik</button>
        <button id="nextBtn" disabled>Next</button>
    `;

    document.getElementById("nextBtn").onclick = () => nextQuestion(qIndex);
}

// ------------------------------
// ANSWER SELECTION
// Highlights the selected answer and enables navigation
// ------------------------------

function selectAnswer(answer) {
    selectedAnswer = answer;

    document.querySelectorAll(".answers li").forEach(li => {
        li.classList.toggle("selected", li.innerText === answer);
    });

    document.getElementById("nextBtn").disabled = false;
}

// ------------------------------
// MODE NAVIGATION
// Switches between visualization and answer modes
// ------------------------------

function goToAnswerMode(id) {
    location.href = `testC.html?q=${id}&mode=answer`;
}

function goBackToView(id) {
    location.href = `testC.html?q=${id}&mode=view`;
}

// ------------------------------
// NEXT QUESTION
// Evaluates the answer and advances to the next item
// ------------------------------

function nextQuestion(qIndex) {
    if (selectedAnswer === questions[qIndex].correct) score++;

    const nextIndex = qIndex + 1;

    if (nextIndex >= questions.length) {
        location.href = "testC.html?done=true";
    } else {
        location.href = `testC.html?q=${questions[nextIndex].id}&mode=view`;
    }
}

// ------------------------------
// PROGRESS BAR AND QUESTION COUNTER
// Updates the visual progress indicator
// ------------------------------

function updateProgress(qIndex) {
    const percent = Math.round((qIndex / questions.length) * 100);
    const bar = document.getElementById("progress");
    bar.style.width = percent + "%";

    document.getElementById("question-counter").textContent =
        `Frage ${qIndex + 1} von ${questions.length}`;
}


// ------------------------------
// RESULT PAGE
// Displays the final score after completion
// ------------------------------

function showResult() {
    document.getElementById("app").innerHTML = `
        <h2>Finished!</h2>
        <p>You got <strong>${score}</strong> out of <strong>${questions.length}</strong> correct.</p>
    `;
    document.getElementById("progress").style.width = "100%";
    document.getElementById("progress").textContent = "100%";
}

// ------------------------------
// INITIALIZATION
// Determines the current state and renders accordingly
// ------------------------------

const state = getStateFromURL();
if (state !== null) {
    if (state.mode === "view") renderViewMode(state.index);
    else renderAnswerMode(state.index);
}
