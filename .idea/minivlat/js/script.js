// ======================================================
// MINI-VLAT — QUESTION DEFINITIONS
// Contains all Mini-VLAT questions including prompt,
// visualization image, answer options, and correct answer
// ======================================================

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

// ======================================================
// GLOBAL TEST STATE
// Stores score, timer reference, remaining time,
// and the currently selected answer
// ======================================================

let score = 0;                   // Number of correctly answered questions
let timer = null;                // Reference to the active countdown timer
let timeLeft = 30;               // Remaining time per question (seconds)
let selectedAnswer = null;       // Currently selected answer option

// ======================================================
// URL HANDLING
// Determines which question to load based on URL
// parameters or whether the test has finished
// ======================================================

function getQuestionIndex() {
    const params = new URLSearchParams(location.search);

    // If the test is finished, show the result screen
    if (params.get("done") === "true") {
        showResult();
        return null;
    }
    
     // If no question ID is provided, start with the first question
    const id = params.get("q");
    if (!id) return 0;

    // Find the index of the question matching the given ID
    return questions.findIndex(q => q.id === id);
}

// ======================================================
// QUESTION RENDERING
// Displays the current question, image, answers,
// timer, and progress bar
// ======================================================

function render(qIndex) {
    const q = questions[qIndex];

    // Reset state for the new question
    selectedAnswer = null;
    timeLeft = 30;

    updateProgress(qIndex);

    document.getElementById("app").innerHTML = `
        <h2>${q.prompt}</h2>
        <img src="${q.img}">

        <div class="timer">⏳ <span id="t">${timeLeft}</span> seconds</div>

        <ul class="answers">
            ${q.answers.map(a => `<li onclick="selectAnswer('${a}')">${a}</li>`).join("")}
        </ul>

        <button id="nextBtn" disabled>Next</button>
    `;

    document.getElementById("nextBtn").onclick = () => next(qIndex);

    startTimer(qIndex);
}

// ======================================================
// TIMER LOGIC
// Counts down once per second and automatically
// advances when time runs out
// ======================================================

function startTimer(qIndex) {
    const t = document.getElementById("t");

    clearInterval(timer);

    timer = setInterval(() => {
        timeLeft--;
        t.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
            autoNext(qIndex);
        }
    }, 1000);
}

// ======================================================
// ANSWER SELECTION
// Highlights the selected answer and enables the
// Next button
// ======================================================

function selectAnswer(answer) {
    selectedAnswer = answer;

    document.querySelectorAll(".answers li").forEach(li => {
        li.classList.toggle("selected", li.innerText === answer);
    });

    document.getElementById("nextBtn").disabled = false;
}

// ======================================================
// AUTOMATIC QUESTION ADVANCE
// Triggered when the timer reaches zero
// ======================================================

function autoNext(qIndex) {
    if (qIndex + 1 >= questions.length) {
        location.href = "index.html?done=true";
    } else {
        const nextId = questions[qIndex + 1].id;
        location.href = `index.html?q=${nextId}`;
    }
}

// ======================================================
// NEXT BUTTON HANDLING
// Evaluates the selected answer and loads the
// next question or finishes the test
// ======================================================

function next(qIndex) {
    clearInterval(timer);

    if (selectedAnswer === questions[qIndex].correct) {
        score++;
    }

    if (qIndex + 1 >= questions.length) {
        location.href = "index.html?done=true";
    } else {
        const nextId = questions[qIndex + 1].id;
        location.href = `index.html?q=${nextId}`;
    }
}

// ======================================================
// PROGRESS BAR UPDATE
// Updates the visual progress indicator based
// on the current question index
// ======================================================

function updateProgress(qIndex) {
    const percent = Math.round((qIndex / questions.length) * 100);
    const bar = document.getElementById("progress");
    bar.style.width = percent + "%";
    bar.textContent = percent + "%";
}

// ======================================================
// RESULT SCREEN
// Displays the final score after completing the test
// ======================================================

function showResult() {
    document.getElementById("app").innerHTML = `
        <h2>Finished!</h2>
        <p>You got <strong>${score}</strong> out of <strong>${questions.length}</strong> correct.</p>
    `;

    document.getElementById("progress").style.width = "100%";
    document.getElementById("progress").textContent = "100%";
}

// ======================================================
// TEST INITIALIZATION
// Determines the current question and starts rendering
// ======================================================

const qIndex = getQuestionIndex();
if (qIndex !== null) render(qIndex);
