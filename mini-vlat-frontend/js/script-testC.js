// ------------------------------
// MINI-VLAT QUESTIONS – identical dataset
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
        correct: "Great Britain"
    },
    {
        id: "map",
        prompt: "In 2020, the unemployment rate for Washington (WA) was higher than that of Wisconsin (WI). True or false?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/map.png",
        answers: ["True", "False"],
        correct: "True"
    },
    {
        id: "pie",
        prompt: "What is the approximate global smartphone market share of Samsung?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/pie.png",
        answers: ["10.9%", "17.6%", "25.3%", "35.2%"],
        correct: "17.6%"
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
        correct: "$0.71"
    },
    {
        id: "stackedarea",
        prompt: "What was the ratio of girls named 'Isla' to girls named 'Amelia' in 2012 in the UK?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/stackedarea.png",
        answers: ["1 to 1", "1 to 2", "1 to 3", "1 to 4"],
        correct: "1 to 2"
    },
    {
        id: "scatter",
        prompt: "There is a negative relationship between height and weight of the 85 males. True or false?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/scatterplot.png",
        answers: ["True", "False"],
        correct: "False"
    }
];

// ------------------------------
// STATE
// ------------------------------
let score = 0;
let selectedAnswer = null;

// ------------------------------
// SCREEN LOGIC
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {

    const numberScreen = document.getElementById("number-input-screen");
    const intro = document.getElementById("testC-intro");
    const app = document.getElementById("app");

    const params = new URLSearchParams(location.search);

    // ---------- 1) RESULT ----------
    if (params.get("done") === "true") {
        numberScreen.style.display = "none";
        intro.style.display = "none";
        app.style.display = "block";
        showResult();
        return;
    }

    // ---------- 2) PARTICIPANT NUMBER REQUIRED ----------
    if (!localStorage.getItem("participantNumber")) {
        numberScreen.style.display = "block";
        intro.style.display = "none";
        app.style.display = "none";
        return;
    }

    // ---------- 3) INTRO ----------
    if (!params.get("q")) {
        numberScreen.style.display = "none";
        intro.style.display = "block";
        app.style.display = "none";
        return;
    }

    // ---------- 4) QUESTION MODE ----------
    numberScreen.style.display = "none";
    intro.style.display = "none";
    app.style.display = "block";

    const qIndex = questions.findIndex(q => q.id === params.get("q"));
    const mode = params.get("mode");

    if (mode === "answer") renderAnswerMode(qIndex);
    else renderViewMode(qIndex);
});

// ------------------------------
// NUMBER SUBMIT
// ------------------------------
document.getElementById("startNumberBtn").addEventListener("click", () => {

    const number = document.getElementById("participantNumber").value.trim();
    if (number.length < 1) return alert("Please enter a Participant Number.");

    localStorage.setItem("participantNumber", number);

    document.getElementById("number-input-screen").style.display = "none";
    document.getElementById("testC-intro").style.display = "block";
});

// ------------------------------
// START TEST
// ------------------------------
document.getElementById("startTestC").addEventListener("click", async () => {

    score = 0;

    const response = await fetch("http://localhost:8000/start", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            participantNumber: localStorage.getItem("participantNumber"),
            test_type: "C"
        })
    });

    const data = await response.json();
    localStorage.setItem("test_id", data.test_id);

    location.href = "?q=treemap&mode=view";
});

// ------------------------------
// VIEW MODE
// ------------------------------
function renderViewMode(index) {

    const q = questions[index];

    updateProgress(index);

    document.getElementById("app").innerHTML = `
        <h2>${q.prompt}</h2>
        <img src="${q.img}" class="vlat-image">

        <button class="start-btn" onclick="location.href='?q=${q.id}&mode=answer'">
            Weiter
        </button>
    `;
}

// ------------------------------
// ANSWER MODE
// ------------------------------
function renderAnswerMode(index) {

    const q = questions[index];
    selectedAnswer = null;

    updateProgress(index);

    document.getElementById("app").innerHTML = `
        <h2>${q.prompt}</h2>

        <ul class="answers">
            ${q.answers.map(a => `<li onclick="selectAnswer('${a}')">${a}</li>`).join("")}
        </ul>

        <button onclick="location.href='?q=${q.id}&mode=view'">Zurück</button>
        <button id="nextBtn" disabled>Next</button>
    `;

    document.getElementById("nextBtn").onclick = () => finishQuestion(index);
}

// ------------------------------
// SELECT ANSWER
// ------------------------------
function selectAnswer(answer) {
    selectedAnswer = answer;

    document.querySelectorAll(".answers li").forEach(li => {
        li.classList.toggle("selected", li.innerText === answer);
    });

    document.getElementById("nextBtn").disabled = false;
}

// ------------------------------
// FINISH ONE QUESTION
// ------------------------------
async function finishQuestion(index) {

    const q = questions[index];
    const correct = (selectedAnswer === q.correct);

    score += correct ? 1 : 0;

    await fetch("http://localhost:8000/answer", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            test_id: localStorage.getItem("test_id"),
            question_id: q.id,
            selected_answer: selectedAnswer,
            correct_answer: q.correct,
            is_correct: correct
        })
    });

    const next = index + 1;

    if (next >= questions.length) {
        location.href = "?done=true";
    } else {
        location.href = `?q=${questions[next].id}&mode=view`;
    }
}

// ------------------------------
// PROGRESS BAR
// ------------------------------
function updateProgress(i) {
    const bar = document.getElementById("progress");
    if (!bar) return;  // <- absolut notwendig!

    bar.style.width = (100 * i / questions.length) + "%";
}


// ------------------------------
// RESULT PAGE
// ------------------------------
async function showResult() {

    await fetch("http://localhost:8000/finish", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            test_id: localStorage.getItem("test_id"),
            score: score
        })
    });

    document.getElementById("app").innerHTML = `
        <div id="result-box">
            <h2>Test C abgeschlossen</h2>
            <p>Du hast <strong>${score}</strong> von ${questions.length} Fragen richtig beantwortet.</p>

            <button class="back-home-btn"
                onclick="location.href='feedback.html?test=C&tid=${localStorage.getItem("test_id")}'">
                Weiter zum Feedback
            </button>
        </div>
    `;
}