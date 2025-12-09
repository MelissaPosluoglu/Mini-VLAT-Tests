// core-render.js
function renderQuestion(id) {
    const index = questions.findIndex(q => q.id === id);
    const test = localStorage.getItem("currentTest");

    if (test === "A") return renderTestA(index);
    if (test === "B") return renderTestB(index);
    if (test === "C") return renderTestC(index);

    // fallback – falls kein Test gesetzt ist
    coreRender(index);
}

function coreRender(index) {
    const q = questions[index];

    document.getElementById("app").innerHTML = `
        <h2>${q.prompt}</h2>
        <img src="${q.img}" class="vlat-image">

        <ul class="answers">
            ${q.answers.map(a => `<li>${a}</li>`).join("")}
        </ul>
    `;
}
