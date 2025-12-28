// core-render.js
// Central rendering logic that dispatches rendering
// to the appropriate test condition (A–D)

/**
 * Renders a question based on its ID and the currently active test condition.
 * The active test is determined via localStorage ("currentTest").
 */
function renderQuestion(id) {
    const index = questions.findIndex(q => q.id === id);

    if (index === -1) {
        console.error("Question not found:", id);
        return;
    }

    const test = localStorage.getItem("currentTest");

    // Dispatch to test-specific render functions
    if (test === "A" && typeof renderTestA === "function") {
        return renderTestA(index);
    }

    if (test === "B" && typeof renderTestB === "function") {
        return renderTestB(index);
    }

    if (test === "C" && typeof renderTestC === "function") {
        return renderTestC(index);
    }
    if (test === "D" && typeof renderTestD === "function") {
        return renderTestD(index);
    }

    // Fallback: neutral rendering without test-specific logic
    coreRender(index);
}

// -----------------------------------------------------
// NEUTRAL RENDERING (no test-specific behavior)
// -----------------------------------------------------

/**
 * Renders a question in a neutral, non-interactive way.
 * Used as a fallback if no test-specific renderer is available.
 */
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
