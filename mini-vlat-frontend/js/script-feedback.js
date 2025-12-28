// =====================================================
// MINI-VLAT — FEEDBACK SCRIPT (FINAL, STABLE)
// =====================================================

const API_BASE = "http://localhost:8000";

document.addEventListener("DOMContentLoaded", () => {

    // -------------------------------------------------
    // Read URL parameters
    // Expected: ?test_id=XYZ&test_type=A|B|C|D
    // -------------------------------------------------
    const params = new URLSearchParams(window.location.search);

    const testId = params.get("test_id");
    const testType = params.get("test_type");

    if (!testId || !testType) {
        alert("Fehlende Testinformationen. Feedback kann nicht zugeordnet werden.");
        return;
    }

    // Set hidden form inputs
    document.getElementById("test_id").value = testId;
    document.getElementById("test_type").value = testType;

   // -------------------------------------------------
    // Optional feedback blocks depending on test type
    // -------------------------------------------------
    const feedbackBlock = document.getElementById("feedback_block");
    if (feedbackBlock) {
        feedbackBlock.style.display = (testType === "B") ? "block" : "none";
    }
});


// =====================================================
// FORM SUBMISSION HANDLER
// =====================================================
document.getElementById("feedbackForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // -------------------------------------------------
    // Build payload (robust & backend-safe)
    // -------------------------------------------------
    const payload = {
        test_id: document.getElementById("test_id").value,
        test_type: document.getElementById("test_type").value,

        difficulty: getRadioNumber("difficulty"),
        mental_load: getRadioNumber("mental_load"),
        stress: getRadioNumber("stress"),
        confidence: getRadioNumber("confidence"),
        strategy_change: getRadioNumber("strategy_change"),

        // Optional field – only included if present
        feedback_helpful: getRadioNumber("feedback_helpful", true),

        task_understanding: getRadioNumber("task_understanding"),
        eye_tracking_issue: getRadioNumber("eye_tracking_issue"),
        distraction: getRadioNumber("distraction"),
        visualization_experience: getRadioNumber("visualization_experience"),

        vision_issue: getRadioValue("vision_issue"),
        vision_aid: getRadioValue("vision_aid"),

        test_time: document.getElementById("test_time")?.value || null,

        fatigue: getRadioNumber("fatigue"),
        viz_test_experience: getRadioNumber("viz_test_experience"),

        open_feedback: document.getElementById("open_feedback")?.value || null
    };

    // -------------------------------------------------
    // Submit feedback to backend
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
// HELPER FUNCTIONS
// =====================================================

/**
 * Returns the numeric value of a selected radio button.
 * If no option is selected, returns 0 or null (if optional).
 */
function getRadioNumber(name, optional = false) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    if (!el) return optional ? null : 0;
    return Number(el.value);
}

/**
 * Returns the value of a selected radio button as a string.
 * Returns null if no option is selected.
 */
function getRadioValue(name) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : null;
}

