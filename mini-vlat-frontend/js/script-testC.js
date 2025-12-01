// ------------------------------
// MINI-VLAT QUESTIONS – identical dataset
// ------------------------------

const questions = [
    {
        id: "treemap",
        prompt: "eBay ist in der Kategorie Software eingeteilt. Wahr oder falsch?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/treemap.png",
        answers: ["Wahr", "Falsch"],
        correct: "Falsch"
    },
    {
        id: "histogram",
        prompt: "Welche Distanz haben die Kunden am meisten zurückgelegt?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/histogram.png",
        answers: ["20–30 km", "50–60 km", "60–70 km", "30–40 km"],
        correct: "30–40 km"
    },
    {
        id: "100stacked",
        prompt: "Welches Land hat den geringsten Anteil an Goldmedaillen?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/100stackedbar.png",
        answers: ["USA", "Großbritannien", "Japan", "Australien"],
        correct: "Großbritannien"
    },
    {
        id: "map",
        prompt: "Im Jahr 2020 war die Arbeitslosenquote in Washington (WA) höher als in Wisconsin (WI). Wahr oder falsch?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/map.png",
        answers: ["Wahr", "Falsch"],
        correct: "Wahr"
    },
    {
        id: "pie",
        prompt: "Wie hoch ist der weltweite Marktanteil von Samsung bei Smartphones?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/pie.png",
        answers: ["10,9%", "17,6%", "25,3%", "35,2%"],
        correct: "17,6%"
    },
    {
        id: "bubble",
        prompt: "Welche Stadt hat die meisten U-Bahn-Stationen?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/bubble.png",
        answers: ["Peking", "Shanghai", "London", "Seoul"],
        correct: "Shanghai"
    },
    {
        id: "stackedbar",
        prompt: "Was kostet eine Tüte Erdnüsse in Seoul?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/stackedbar.png",
        answers: ["7,5$", "6,1$", "5,2$", "4,5$"],
        correct: "6,1$"
    },
    {
        id: "line",
        prompt: "Wie hoch war der Preis für ein Barrel Öl im Februar 2020?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/line.png",
        answers: ["50,54$", "42,34$", "47,02$", "43,48$"],
        correct: "50,54$"
    },
    {
        id: "bar",
        prompt: "Wie hoch ist die durchschnittliche Internetgeschwindigkeit in Japan?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/bar.png",
        answers: ["40,51 Mbps", "16,16 Mbps", "35,25 Mbps", "42,30 Mbps"],
        correct: "40,51 Mbps"
    },
    {
        id: "area",
        prompt: "Wie hoch war der durchschnittliche Preis für ein Pfund Kaffee im Oktober 2019?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/area.png",
        answers: ["0,71$", "0,63$", "0,80$", "0,90$"],
        correct: "0,71$"
    },
    {
        id: "stackedarea",
        prompt: "Wie war das Verhältnis der Mädchen namens 'Isla' zu den Mädchen namens 'Amelia' im Jahr 2012 im Vereinigten Königreich?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/stackedarea.png",
        answers: ["1 zu 1", "1 zu 2", "1 zu 3", "1 zu 4"],
        correct: "1 zu 2"
    },
    {
        id: "scatter",
        prompt: "Es gibt eine negative Beziehung zwischen der Körpergröße und dem Gewicht der 85 Männer. Wahr oder falsch?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/scatterplot.png",
        answers: ["Wahr", "Falsch"],
        correct: "Falsch"
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

      <button class="nav-btn back-btn" onclick="location.href='?q=${q.id}&mode=view'">Zurück</button>
      <button class="nav-btn next-btn" id="nextBtn" disabled>Next</button>
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