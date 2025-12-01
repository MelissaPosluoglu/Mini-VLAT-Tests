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
// URL → Frage & Modus bestimmen
// ------------------------------

function getStateFromURL() {
    const params = new URLSearchParams(location.search);

    if (params.get("done") === "true") {
        showResult();
        return null;
    }

    const id = params.get("q");
    const mode = params.get("mode") || "view";

    const index = questions.findIndex(q => q.id === id);

    return { index: index === -1 ? 0 : index, mode };
}

// ------------------------------
// RENDER VIEW MODE (nur Grafik + Frage)
// ------------------------------

function renderViewMode(qIndex) {
    const q = questions[qIndex];

    updateProgress(qIndex);

    document.getElementById("app").innerHTML = `
        <h2>${q.prompt}</h2>
        <img src="${q.img}" class="vlat-image">
        <button onclick="goToAnswerMode('${q.id}')">Weiter</button>
    `;
}

// ------------------------------
// RENDER ANSWER MODE (Antwortoptionen)
// ------------------------------

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
        <button id="nextBtn" disabled>Weiter</button>
    `;

    document.getElementById("nextBtn").onclick = () => nextQuestion(qIndex);
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
// NAVIGATION
// ------------------------------

function goToAnswerMode(id) {
    location.href = `testC.html?q=${id}&mode=answer`;
}

function goBackToView(id) {
    location.href = `testC.html?q=${id}&mode=view`;
}

// ------------------------------
// NEXT QUESTION
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
// PROGRESS BAR
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
// INIT
// ------------------------------

const state = getStateFromURL();
if (state !== null) {
    if (state.mode === "view") renderViewMode(state.index);
    else renderAnswerMode(state.index);
}
