// ------------------------------
// MINI-VLAT QUESTIONS
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
    { id:"stackedarea", prompt:"Girls named Isla to Amelia ratio in 2012?", img:"https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/stackedarea.png", answers:["1 to 1","1 to 2","1 to 3","1 to 4"], correct:"1 to 4" },
    { id:"scatter", prompt:"Negative relationship between height & weight?", img:"https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/scatterplot.png", answers:["True","False"], correct:"False" }
];

// ------------------------------
// STATE
// ------------------------------

let score = 0;
let selectedAnswer = null;

// ------------------------------
// URL HANDLING
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
    selectedAnswer = null;

    updateProgress(qIndex);

    document.getElementById("app").innerHTML = `
        <h2>${q.prompt}</h2>
       <img src="${q.img}" class="vlat-image">
        
        <ul class="answers">
            ${q.answers.map(a => `<li onclick="selectAnswer('${a}', ${qIndex})">${a}</li>`).join("")}
        </ul>

        <div id="feedback" style="font-size:20px; margin-top:15px;"></div>

        <button id="nextBtn" disabled>Next</button>
    `;

    document.getElementById("nextBtn").onclick = () => next(qIndex);
}

// ------------------------------
// SELECT ANSWER + FEEDBACK
// ------------------------------

function selectAnswer(answer, qIndex) {
    selectedAnswer = answer;

    document.querySelectorAll(".answers li").forEach(li => {
        li.classList.toggle("selected", li.innerText === answer);
    });

    const correct = questions[qIndex].correct;
    const fb = document.getElementById("feedback");

    if (answer === correct) {
        fb.innerHTML = "✅ Correct!";
    } else {
        fb.innerHTML = `❌ Incorrect<br>Correct answer: <strong>${correct}</strong>`;
    }

    document.getElementById("nextBtn").disabled = false;
}

// ------------------------------
// NEXT QUESTION
// ------------------------------

function next(qIndex) {
    if (selectedAnswer === questions[qIndex].correct) score++;

    const nextIndex = qIndex + 1;

    if (nextIndex >= questions.length) {
        location.href = "testB.html?done=true";
    } else {
        const nextId = questions[nextIndex].id;
        location.href = `testB.html?q=${nextId}`;
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
// INITIALIZE
// ------------------------------

const qIndex = getQuestionIndex();
if (qIndex !== null) render(qIndex);
