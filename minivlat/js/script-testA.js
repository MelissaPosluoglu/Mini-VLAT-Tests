// =====================================================
// MINI-VLAT — Test A (Zeitdruck) – FINAL VERSION
// =====================================================

// ------------------------------
// QUESTIONS
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
// STATE
// ------------------------------

let score = 0;
let timer = null;
let timeLeft = 30;

// ------------------------------
// PREVENT BACK NAVIGATION (WICHTIG!)
// ------------------------------

history.pushState(null, "", location.href);
window.onpopstate = function () {
    history.pushState(null, "", location.href);
};


// ------------------------------
// GET QUESTION INDEX
// ------------------------------

function getQuestionIndex() {
    const params = new URLSearchParams(location.search);

    if (params.get("done") === "true") {
        showResult();
        return null;
    }

    const id = params.get("q");
    if (!id) return 0;

    return questions.findIndex(q => q.id === id);
}


// ------------------------------
// RENDER QUESTION
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
// CIRCULAR TIMER
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
                        <stop offset="0%" stop-color="#2f9e44"/>
                        <stop offset="100%" stop-color="#54d26a"/>
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

        progress.style.strokeDashoffset = offsetStep * (30 - timeLeft);

        if (timeLeft <= 0) {
            clearInterval(timer);
            autoNext(qIndex);
        }
    }, 1000);
}


// ------------------------------
// ANSWER SELECT → auto next
// ------------------------------

function selectAnswer(answer, qIndex) {
    if (answer === questions[qIndex].correct) score++;
    autoNext(qIndex);
}


// ------------------------------
// NAVIGATION
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
// PROGRESSBAR
// ------------------------------

function updateProgress(i) {
    const percent = Math.round((i / questions.length) * 100);
    document.getElementById("progress").style.width = percent + "%";
}


// ------------------------------
// RESULT SCREEN
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
// START
// ------------------------------

const qIndex = getQuestionIndex();
if (qIndex !== null) render(qIndex);
