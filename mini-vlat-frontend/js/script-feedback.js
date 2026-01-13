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

        // Difficulty / Cognitive Load
        difficulty: getRadioNumber("difficulty"),
        mental_load: getRadioNumber("mental_load"),
        stress: getRadioNumber("stress"),

        // NASA-TLX Ergänzungen
        temporal_demand: getRadioNumber("temporal_demand", true),
        physical_demand: getRadioNumber("physical_demand", true),

        // Verständnis & Strategie
        confidence: getRadioNumber("confidence"),
        task_understanding: getRadioNumber("task_understanding"),
        strategy_change: getRadioNumber("strategy_change"),

        // Sehvermögen
        vision_issue: getRadioValue("vision_issue"),
        vision_type: getRadioValue("vision_type"),
        vision_aid: getRadioValue("vision_aid"),

        // Testumgebung
        eye_tracking_issue: getRadioNumber("eye_tracking_issue", true),
        distraction: getRadioNumber("distraction", true),
        fatigue: getRadioNumber("fatigue", true),
        test_time: document.getElementById("test_time")?.value || null,

        // Erfahrung
        visualization_experience: getRadioNumber("visualization_experience", true),
        viz_test_experience: getRadioNumber("viz_test_experience", true),

        // 🆕 Demographie
        age: Number(document.getElementById("age")?.value) || null,
        gender: document.getElementById("gender")?.value || null,
        field_of_study: document.getElementById("field_of_study")?.value || null,

        // Freitext
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


function toggleVisionType(show) {
    const wrapper = document.getElementById("vision-type-wrapper");

    if (show) {
        wrapper.style.display = "block";
    } else {
        wrapper.style.display = "none";

        // Auswahl zurücksetzen, falls vorher etwas gewählt wurde
        const radios = wrapper.querySelectorAll('input[type="radio"]');
        radios.forEach(r => r.checked = false);
    }
}
// =====================================================
// FORM VALIDATION — ENABLE SUBMIT ONLY WHEN COMPLETE
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("feedbackForm");
    const submitBtn = document.getElementById("submitBtn");

    function allQuestionsAnswered() {

        // Alle Pflicht-Radio-Gruppen
        const requiredRadioGroups = [
            "difficulty",
            "mental_load",
            "stress",
            "temporal_demand",
            "physical_demand",
            "confidence",
            "task_understanding",
            "diagram_quality",
            "strategy_change",
            "eye_tracking_issue",
            "distraction",
            "fatigue",
            "visualization_experience",
            "viz_test_experience"
        ];

        for (const name of requiredRadioGroups) {
            if (!document.querySelector(`input[name="${name}"]:checked`)) {
                return false;
            }
        }

        // Vision (Pflicht)
        const visionIssue = document.querySelector(`input[name="vision_issue"]:checked`);
        if (!visionIssue) return false;

        if (visionIssue.value === "yes") {
            if (!document.querySelector(`input[name="vision_type"]:checked`)) {
                return false;
            }
        }

        if (!document.querySelector(`input[name="vision_aid"]:checked`)) {
            return false;
        }

        // Select-Felder
        if (!document.getElementById("gender").value) return false;
        if (!document.getElementById("test_time").value) return false;

        // Demographie
        if (!document.getElementById("age").value) return false;
        if (!document.getElementById("field_of_study").value.trim()) return false;

        return true;
    }

    function updateSubmitButton() {
        submitBtn.disabled = !allQuestionsAnswered();
    }

    // Auf jede Änderung reagieren
    form.addEventListener("change", updateSubmitButton);
    form.addEventListener("input", updateSubmitButton);

    // Sicherheitsnetz: auch beim Submit blocken
    form.addEventListener("submit", (e) => {
        if (!allQuestionsAnswered()) {
            e.preventDefault();
            alert("Please answer ALL questions before submitting the form.");
        }
    });
});