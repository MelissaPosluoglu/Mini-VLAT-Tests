// =====================================================
// MINI-VLAT — Test A (Zeitdruck) – STABLE FINAL VERSION
// =====================================================

// ------------------------------
// QUESTIONS
// ------------------------------

const questions = [
    {
        id: "treemap",
        prompt: "eBay is nested in the Software category. True or false?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/treemap.png",
        answers: ["True", "False"],
        correct: "False"
    },
    {
        id: "histogram",
        prompt: "What distance have customers traveled the most?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/histogram.png",
        answers: ["20–30 km", "50–60 km", "60–70 km", "30–40 km"],
        correct: "30–40 km"
    },
    {
        id: "100stacked",
        prompt: "Which country has the lowest proportion of Gold medals?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/100stackedbar.png",
        answers: ["U.S.A.", "Great Britain", "Japan", "Australia"],
        correct: "Japan"
    },
    {
        id: "map",
        prompt: "In 2020, Washington (WA) had a higher unemployment rate than Wisconsin (WI). True or false?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/map.png",
        answers: ["True", "False"],
        correct: "True"
    },
    {
        id: "pie",
        prompt: "What is the approximate global smartphone market share of Samsung?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/pie.png",
        answers: ["10.9%", "17.6%", "25.3%", "35.2%"],
        correct: "25.3%"
    },
    {
        id: "bubble",
        prompt: "Which has the largest number of metro stations?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/bubble.png",
        answers: ["Beijing", "Shanghai", "London", "Seoul"],
        correct: "Shanghai"
    },
    {
        id: "stackedbar",
        prompt: "What is the cost of peanuts in Seoul?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/stackedbar.png",
        answers: ["$7.5", "$6.1", "$5.2", "$4.5"],
        correct: "$6.1"
    },
    {
        id: "line",
        prompt: "What was the price of a barrel of oil in February 2020?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/line.png",
        answers: ["$50.54", "$42.34", "$47.02", "$43.48"],
        correct: "$50.54"
    },
    {
        id: "bar",
        prompt: "What is the average internet speed in Japan?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/bar.png",
        answers: ["40.51 Mbps", "16.16 Mbps", "35.25 Mbps", "42.30 Mbps"],
        correct: "40.51 Mbps"
    },
    {
        id: "area",
        prompt: "What was the average price of a pound of coffee in October 2019?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/area.png",
        answers: ["$0.71", "$0.63", "$0.80", "$0.90"],
        correct: "$0.80"
    },
    {
        id: "stackedarea",
        prompt: "What was the ratio of girls named 'Isla' to girls named 'Amelia' in 2012?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/stackedarea.png",
        answers: ["1 to 1", "1 to 2", "1 to 3", "1 to 4"],
        correct: "1 to 4"
    },
    {
        id: "scatter",
        prompt: "There is a negative relationship between height and weight. True or false?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/scatterplot.png",
        answers: ["True", "False"],
        correct: "False"
    }
];


// ------------------------------
// STATE
// ------------------------------

let score = 0;
let timer = null;
let timeLeft = 30;

// ------------------------------
// SCREEN LOGIC
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {

    const nameScreen = document.getElementById("name-input-screen");
    const intro = document.getElementById("testA-intro");
    const app = document.getElementById("app");

    const params = new URLSearchParams(location.search);

    // ---------- 1) Ergebnis? ----------
    if (params.get("done") === "true") {
        nameScreen.style.display = "none";
        intro.style.display = "none";
        app.style.display = "block";
        showResult();
        return;
    }

    // ---------- 2) Kein Name gespeichert → Name Screen anzeigen ----------
    if (!localStorage.getItem("username")) {
        nameScreen.style.display = "block";
        intro.style.display = "none";
        app.style.display = "none";
        return;
    }

    // ---------- 3) Name existiert, aber keine Frage → Intro anzeigen ----------
    if (!params.get("q")) {
        nameScreen.style.display = "none";
        intro.style.display = "block";
        app.style.display = "none";
        return;
    }

    // ---------- 4) Frage-Modus ----------
    nameScreen.style.display = "none";
    intro.style.display = "none";
    app.style.display = "block";

    const qIndex = getQuestionIndex();
    if (qIndex !== -1) render(qIndex);
});

// ------------------------------
// NAME SUBMIT
// ------------------------------
document.getElementById("startNameBtn").addEventListener("click", () => {

    const name = document.getElementById("username").value.trim();
    if (name.length < 2) return alert("Please enter a valid name.");

    localStorage.setItem("username", name);

    document.getElementById("name-input-screen").style.display = "none";
    document.getElementById("testA-intro").style.display = "block";
});

document.getElementById("startTestA").addEventListener("click", async () => {

    score = 0;

    // BACKEND: Test starten
    const response = await fetch("http://localhost:8000/start", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            username: localStorage.getItem("username"),
            test_type: "A"
        })
    });

    const data = await response.json();
    localStorage.setItem("test_id", data.test_id);

    localStorage.setItem("scoreA", 0);

    history.pushState(null, "", "?q=treemap");

    document.getElementById("testA-intro").style.display = "none";
    document.getElementById("app").style.display = "block";

    render(0);
});



// ------------------------------
// GET QUESTION INDEX
// ------------------------------
function getQuestionIndex() {
    const id = new URLSearchParams(location.search).get("q");
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
// TIMER — ORIGINAL FIX
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
                    <linearGradient id="timerGradientBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#3b6ff5"/>
                        <stop offset="100%" stop-color="#2457d6"/>
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
// ANSWER
// ------------------------------
async function selectAnswer(answer, qIndex) {

    const correct = (answer === questions[qIndex].correct);

    // BACKEND: Antwort speichern
    await fetch("http://localhost:8000/answer", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            test_id: localStorage.getItem("test_id"),
            question_id: questions[qIndex].id,
            selected_answer: answer,
            correct_answer: questions[qIndex].correct,
            time_taken: 30 - timeLeft,
            is_correct: correct
        })
    });

    if (correct) {
        score++;
        localStorage.setItem("scoreA", score);
    }

    autoNext(qIndex);
}


// ------------------------------
// AUTO NEXT
// ------------------------------
function autoNext(qIndex) {
    if (qIndex + 1 >= questions.length) {
        location.href = "testA.html?done=true";
        return;
    }
    location.href = `testA.html?q=${questions[qIndex + 1].id}`;
}

// ------------------------------
// PROGRESS BAR
// ------------------------------
function updateProgress(i) {
    document.getElementById("progress").style.width =
        (100 * i / questions.length) + "%";
}

// ------------------------------
// RESULT
// ------------------------------
async function showResult() {

    const finalScore = Number(localStorage.getItem("scoreA")) || 0;

    await fetch("http://localhost:8000/finish", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            test_id: localStorage.getItem("test_id"),
            total_time: 12 * 30,  // später Timer summieren
            score: finalScore
        })
    });

    document.getElementById("app").innerHTML = `
        <div id="result-box">
            <h2>Test abgeschlossen</h2>
            <p>Du hast <strong>${finalScore}</strong> von ${questions.length} Fragen richtig beantwortet.</p>
            <button class="back-home-btn" onclick="location.href='index.html'">Zurück zur Startseite</button>
        </div>
    `;

    localStorage.removeItem("scoreA");
}

