// core-render.js

function renderQuestion(id) {
    const index = questions.findIndex(q => q.id === id);

    if (index === -1) {
        console.error("Question not found:", id);
        return;
    }

    const test = localStorage.getItem("currentTest");

    if (test === "A" && typeof renderTestA === "function") {
        return renderTestA(index);
    }

    if (test === "B" && typeof renderTestB === "function") {
        return renderTestB(index);
    }

    if (test === "C" && typeof renderTestC === "function") {
        return renderTestC(index);
    }

    // ✅ Fallback: neutrale Darstellung
    coreRender(index);
}

// -----------------------------------------------------
// NEUTRALES RENDERING (ohne Testlogik)
// -----------------------------------------------------
function coreRender(index) {
    const q = questions[index];

    document.getElementById("app").innerHTML = `
        <h2 class="prompt-text">${q.prompt}</h2>

        <div class="image-wrapper">
            <img src="${q.img}" class="vlat-image" alt="">
        </div>

        <ul class="answers">
            ${q.answers.map(a => `<li class="answer-option">${a}</li>`).join("")}
        </ul>
    `;
}
