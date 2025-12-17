// =====================================================
// MINI-VLAT — FEEDBACK SCRIPT (FINAL, STABLE)
// =====================================================

const API_BASE = "http://localhost:8000";

document.addEventListener("DOMContentLoaded", () => {

    // -------------------------------------------------
    // URL Parameter lesen
    // Erwartet: ?test_id=XYZ&test_type=A|B|C
    // -------------------------------------------------
    const params = new URLSearchParams(window.location.search);

    const testId = params.get("test_id");
    const testType = params.get("test_type");

    if (!testId || !testType) {
        alert("Fehlende Testinformationen. Feedback kann nicht zugeordnet werden.");
        return;
    }

    // Hidden Inputs setzen
    document.getElementById("test_id").value = testId;
    document.getElementById("test_type").value = testType;

    // -------------------------------------------------
    // Optionale Blöcke je nach Testtyp
    // -------------------------------------------------
    const feedbackBlock = document.getElementById("feedback_block");
    if (feedbackBlock) {
        feedbackBlock.style.display = (testType === "B") ? "block" : "none";
    }
});


// =====================================================
// FORM SUBMIT
// =====================================================

document.getElementById("feedbackForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // -------------------------------------------------
    // Payload aufbauen (robust & backend-sicher)
    // -------------------------------------------------
    const payload = {
        test_id: document.getElementById("test_id").value,
        test_type: document.getElementById("test_type").value,

        difficulty: getRadioNumber("difficulty"),
        mental_load: getRadioNumber("mental_load"),
        stress: getRadioNumber("stress"),
        confidence: getRadioNumber("confidence"),

        strategy_change: getRadioNumber("strategy_change"),

        // Optional – nur wenn vorhanden
        feedback_helpful: getRadioNumber("feedback_helpful", true),

        vision_issue: getRadioValue("vision_issue"),
        vision_aid: getRadioValue("vision_aid"),

        test_time: document.getElementById("test_time")?.value || null,

        fatigue: getRadioNumber("fatigue"),

        open_feedback: document.getElementById("open_feedback")?.value || null
    };

    // -------------------------------------------------
    // Absenden
    // -------------------------------------------------
    try {
        const res = await fetch(`${API_BASE}/feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error("Feedback konnte nicht gespeichert werden");
        }

        alert("Vielen Dank! Ihr Feedback wurde gespeichert.");
        window.location.href = "../html/results.html";

    } catch (err) {
        console.error(err);
        alert("Fehler beim Speichern des Feedbacks.");
    }
});


// =====================================================
// HILFSFUNKTIONEN
// =====================================================

function getRadioNumber(name, optional = false) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    if (!el) return optional ? null : 0;
    return Number(el.value);
}

function getRadioValue(name) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : null;
}
