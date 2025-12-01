// ------------------------------
// MINI-VLAT QUESTIONS
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
// URL HANDLING
// ------------------------------
// ------------------------------
// SCREEN LOGIC
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {

    const nameScreen = document.getElementById("name-input-screen");
    const intro = document.getElementById("testB-intro");
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
    if (name.length < 2) return alert("Bitte geben Sie einen gültigen Namen ein !");

    localStorage.setItem("username", name);

    document.getElementById("name-input-screen").style.display = "none";
    document.getElementById("testB-intro").style.display = "block";
});

// ------------------------------
// INTRO: NEXT BUTTON
// ------------------------------
document.getElementById("startTestB").addEventListener("click", async () => {

    score = 0;

    const response = await fetch("http://localhost:8000/start", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            username: localStorage.getItem("username"),   // <-- HIER FIX
            test_type: "B"
        })
    });

    const data = await response.json();
    localStorage.setItem("test_id_B", data.test_id);

    history.pushState(null, "", "?q=treemap");

    document.getElementById("testB-intro").style.display = "none";
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
    selectedAnswer = null;

    updateProgress(qIndex);

    document.getElementById("app").innerHTML = `
        <div id="question-counter">Frage ${qIndex + 1} von ${questions.length}</div>

        <h2>${q.prompt}</h2>
        <img src="${q.img}" class="vlat-image">

        <ul class="answers">
            ${q.answers.map(a => `<li onclick="selectAnswer('${a}', ${qIndex})">${a}</li>`).join("")}
        </ul>

        <div id="feedback" style="font-size:20px; margin-top:15px;"></div>

        <button id="nextBtn" class="next-btn" disabled>Weiter</button>
    `;

    document.getElementById("nextBtn").onclick = () => next(qIndex);
}

// ------------------------------
// ANSWER + FEEDBACK
// ------------------------------
async function selectAnswer(answer, qIndex) {

    selectedAnswer = answer;
    const correct = questions[qIndex].correct;


    // ---------- BACKEND SPEICHERN ----------
    await fetch("http://localhost:8000/answer", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            test_id: localStorage.getItem("test_id_B"),
            question_id: questions[qIndex].id,
            selected_answer: answer,
            correct_answer: questions[qIndex].correct,
            is_correct: (answer === questions[qIndex].correct),
            time_taken: 0
        })
    });


    const lis = document.querySelectorAll(".answers li");

    // Reset
    lis.forEach(li => {
        li.classList.remove("selected", "answer-correct", "answer-wrong", "answer-selected");
    });

    // Richtig beantwortet
    if (answer === correct) {

        lis.forEach(li => {
            if (li.innerText === correct) {
                li.classList.add("answer-correct", "answer-selected"); // deine Antwort hervorheben
            }
        });

    } else {
        // Falsch → ALLE falschen rot
        lis.forEach(li => {
            if (li.innerText !== correct) {
                li.classList.add("answer-wrong");
            }
        });

        // richtige Antwort grün
        lis.forEach(li => {
            if (li.innerText === correct) {
                li.classList.add("answer-correct");
            }
        });

        // deine angeklickte zusätzlich hervorheben
        lis.forEach(li => {
            if (li.innerText === answer) {
                li.classList.add("answer-selected");
            }
        });
    }

    // Feedback
    const fb = document.getElementById("feedback");
    if (answer === correct) {
        fb.className = "correct";
        fb.innerHTML = "✔ Correct!";
    } else {
        fb.className = "incorrect";
        fb.innerHTML = `✖ Incorrect<br>Correct answer: <strong>${correct}</strong>`;
    }

    document.getElementById("nextBtn").disabled = false;
}




// ------------------------------
// NEXT QUESTION
// ------------------------------
async function next(qIndex) {


    const nextIndex = qIndex + 1;

    if (nextIndex >= questions.length) {

        await fetch("http://localhost:8000/finish", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                test_id: localStorage.getItem("test_id_B"),
                total_time: 0,
                score: score
            })
        });

        location.href = "testB.html?done=true";
        return;
    }

    location.href = `testB.html?q=${questions[nextIndex].id}`;
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

    const res = await fetch(`http://localhost:8000/results/B`);
    const all = await res.json();

    const testId = localStorage.getItem("test_id_B");
    const my = all.find(x => x._id === testId);

    const finalScore = my?.score ?? 0;

    document.getElementById("app").innerHTML = `
        <h2>Finished!</h2>
        <p>You got <strong>${finalScore}</strong> out of <strong>${questions.length}</strong> correct.</p>
       <button class="back-home-btn"
            onclick="location.href='feedback.html?test=B&tid=${localStorage.getItem("test_id_B")}'">
            Weiter zum Feedback
        </button>

    `;
}
