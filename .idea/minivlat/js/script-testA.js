// =====================================================
// MINI-VLAT — Test A (Time Pressure)
// This version implements a strict time limit per question
// and automatically advances after answer selection or
// when the timer expires.
// =====================================================


// ------------------------------
// QUESTION SET
// Defines all Mini-VLAT questions including prompt,
// visualization image, answer options, and correct answer
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
    { id:"stackedarea", prompt:"Girls named Isla to Amelia ratio in 2012 (UK)?", img:"https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/stackedarea.png", answers:["1 to 1","1 to 2","1 to 3","1 to 4"], correct:"1 to 4" },
    { id:"scatter", prompt:"Negative relationship between height & weight?", img:"https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/scatterplot.png", answers:["True","False"], correct:"False" }
];

// ------------------------------
// GLOBAL STATE
// Stores score, timer reference, and remaining time
// ------------------------------

let score = 0;        // Number of correct answers
let timer = null;     // Active timer reference
let timeLeft = 30;    // Remaining time per question (seconds)

// ------------------------------
// PREVENT BACK NAVIGATION (IMPORTANT)
// Prevents participants from navigating back to
// previous questions using the browser history
// ------------------------------

history.pushState(null, "", location.href);
window.onpopstate = function () {
    history.pushState(null, "", location.href);
};


// ------------------------------
// GET CURRENT QUESTION INDEX
// Determines which question to load based on URL
// parameters or shows the result screen if finished
// ------------------------------

function getQuestionIndex() {
    const params = new URLSearchParams(location.search);

    
    // Test completed → show result screen
    if (params.get("done") === "true") {
        showResult();
        return null;
    }

    // No question specified → start with first question
    const id = params.get("q");
    if (!id) return 0;

    // Find question index by ID
    return questions.findIndex(q => q.id === id);
}


// ------------------------------
// RENDER QUESTION
// Displays question header, prompt, visualization,
// answer options, and initializes the timer
// ------------------------------

function render(qIndex) {
    const q = questions[qIndex];
    timeLeft = 30;

    updateProgress(qIndex);

    document.getElementById("app").innerHTML = `
        <div class="question-header">
            <div id="question-counter">Frage ${qIndex + 1} von ${questions.length}</div>
            <div id="timer-box"></div>
        </div>

        <h2 class="prompt-text">${q.prompt}</h2>

        <img src="${q.img}" class="vlat-image">

        <ul class="answers">
            ${q.answers.map(a => `<li onclick="selectAnswer('${a}', ${qIndex})">${a}</li>`).join("")}
        </ul>
    `;

    startTimer(qIndex);
}


// ------------------------------
// CIRCULAR COUNTDOWN TIMER
// Visual circular timer that decreases continuously
// and triggers automatic navigation when time runs out
// ------------------------------

function startTimer(qIndex) {
    clearInterval(timer);
    timeLeft = 30;

    const radius = 30;
    const circumference = 2 * Math.PI * radius;

    document.getElementById("timer-box").innerHTML = `
        <div id="circle-timer">
            <svg>
                <defs>
                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#7b6dff"/>
                        <stop offset="100%" stop-color="#5a48e8"/>
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

    const offsetStep = circumference / 30;

    timer = setInterval(() => {
        timeLeft--;
        timeText.textContent = timeLeft;

         // Update circular progress indicator
        progress.style.strokeDashoffset = offsetStep * (30 - timeLeft);

        if (timeLeft <= 0) {
            clearInterval(timer);
            autoNext(qIndex);
        }
    }, 1000);
}


// ------------------------------
// ANSWER SELECTION
// Immediately evaluates the answer and advances
// to the next question
// ------------------------------

function selectAnswer(answer, qIndex) {
    if (answer === questions[qIndex].correct) score++;
    autoNext(qIndex);
}


// ------------------------------
// QUESTION NAVIGATION
// Loads the next question or finishes the test
// ------------------------------

function autoNext(qIndex) {
    if (qIndex + 1 >= questions.length) {
        location.href = "testA.html?done=true";
    } else {
        const nextId = questions[qIndex + 1].id;
        location.href = `testA.html?q=${nextId}`;
    }
}



// ------------------------------
// PROGRESS BAR UPDATE
// Updates the progress indicator based on
// the current question index
// ------------------------------

function updateProgress(i) {
    const percent = Math.round((i / questions.length) * 100);
    document.getElementById("progress").style.width = percent + "%";
}


// ------------------------------
// RESULT SCREEN
// Displays the final score after test completion
// ------------------------------

function showResult() {
    document.getElementById("app").innerHTML = `
        <div id="result-box">
            <h2>Test abgeschlossen</h2>

            <p>Du hast <strong>${score}</strong> von ${questions.length} Fragen richtig beantwortet.</p>

            <button class="back-home-btn" onclick="location.href='index.html'">
                Zurück zur Startseite
            </button>
        </div>
    `;

    document.getElementById("progress").style.width = "100%";
}


// ------------------------------
// TEST INITIALIZATION
// Determines the current question and starts rendering
// ------------------------------

const qIndex = getQuestionIndex();
if (qIndex !== null) render(qIndex);
