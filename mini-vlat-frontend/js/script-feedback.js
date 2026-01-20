// =====================================================
// MINI-VLAT — FEEDBACK SCRIPT (FINAL, CLEAN, LOCAL)
// =====================================================

const API_BASE = "http://localhost:8000";

document.addEventListener("DOMContentLoaded", () => {

    // -------------------------------------------------
    // READ URL PARAMETERS
    // -------------------------------------------------
    const params = new URLSearchParams(window.location.search);
    const testId = params.get("test_id");
    const testType = params.get("test_type");

    if (!testId || !testType) {
        alert("Fehlende Testinformationen. Feedback kann nicht zugeordnet werden.");
        return;
    }

    // -------------------------------------------------
    // SET HIDDEN INPUTS
    // -------------------------------------------------
    document.getElementById("test_id").value = testId;
    document.getElementById("test_type").value = testType;

    // -------------------------------------------------
    // OPTIONAL BLOCKS BY TEST TYPE
    // -------------------------------------------------
    const feedbackBlock = document.getElementById("feedback_block");
    if (feedbackBlock) {
        feedbackBlock.style.display = (testType === "B") ? "block" : "none";
    }

    // -------------------------------------------------
    // PRELOAD EXISTING FEEDBACK (EDIT MODE)
    // -------------------------------------------------
    preloadFeedback(testId).then(() => {
        updateSubmitButton();
    });

    // -------------------------------------------------
    // FORM VALIDATION SETUP
    // -------------------------------------------------
    const form = document.getElementById("feedbackForm");
    const submitBtn = document.getElementById("submitBtn");

    form.addEventListener("change", updateSubmitButton);
    form.addEventListener("input", updateSubmitButton);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!allQuestionsAnswered()) {
            alert("Please answer ALL questions before submitting the form.");
            return;
        }
        await submitFeedback();
    });

    function updateSubmitButton() {
        submitBtn.disabled = !allQuestionsAnswered();
    }

    function allQuestionsAnswered() {

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

        const visionIssue = document.querySelector(`input[name="vision_issue"]:checked`);
        if (!visionIssue) return false;

        if (visionIssue.value === "yes") {
            if (!document.querySelector(`input[name="vision_type"]:checked`)) {
                return false;
            }
        }

        if (!document.querySelector(`input[name="vision_aid"]:checked`)) return false;
        if (!document.getElementById("gender").value) return false;
        if (!document.getElementById("test_time").value) return false;
        if (!document.getElementById("age").value) return false;
        if (!document.getElementById("field_of_study").value.trim()) return false;

        return true;
    }
});

// =====================================================
// SUBMIT FEEDBACK
// =====================================================

async function submitFeedback() {

    const payload = {
        test_id: getVal("test_id"),
        test_type: getVal("test_type"),

        difficulty: getRadioNumber("difficulty"),
        mental_load: getRadioNumber("mental_load"),
        stress: getRadioNumber("stress"),
        temporal_demand: getRadioNumber("temporal_demand", true),
        physical_demand: getRadioNumber("physical_demand", true),

        confidence: getRadioNumber("confidence"),
        task_understanding: getRadioNumber("task_understanding"),
        strategy_change: getRadioNumber("strategy_change"),

        vision_issue: getRadioValue("vision_issue"),
        vision_type: getRadioValue("vision_type"),
        vision_aid: getRadioValue("vision_aid"),

        eye_tracking_issue: getRadioNumber("eye_tracking_issue", true),
        distraction: getRadioNumber("distraction", true),
        fatigue: getRadioNumber("fatigue", true),
        test_time: getVal("test_time"),

        visualization_experience: getRadioNumber("visualization_experience", true),
        viz_test_experience: getRadioNumber("viz_test_experience", true),

        age: Number(getVal("age")) || null,
        gender: getVal("gender"),
        field_of_study: getVal("field_of_study"),

        open_feedback: getVal("open_feedback")
    };

    try {
        const res = await fetch(`${API_BASE}/feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error();

        alert("Vielen Dank! Ihr Feedback wurde gespeichert.");
        window.location.href = "../html/results.html";

    } catch {
        alert("Fehler beim Speichern des Feedbacks.");
    }
}

// =====================================================
// PRELOAD EXISTING FEEDBACK (EDIT MODE)
// =====================================================

async function preloadFeedback(testId) {
    try {
        const res = await fetch(`${API_BASE}/feedback/test/${encodeURIComponent(testId)}`);
        if (!res.ok) return;

        const f = (await res.json()).feedback;

        setValue("age", f.age);
        setValue("gender", f.gender);
        setValue("field_of_study", f.field_of_study);
        setValue("test_time", f.test_time);
        setValue("open_feedback", f.open_feedback);

        setRadio("difficulty", f.difficulty);
        setRadio("mental_load", f.mental_load);
        setRadio("stress", f.stress);
        setRadio("temporal_demand", f.temporal_demand);
        setRadio("physical_demand", f.physical_demand);
        setRadio("confidence", f.confidence);
        setRadio("task_understanding", f.task_understanding);
        setRadio("strategy_change", f.strategy_change);
        setRadio("eye_tracking_issue", f.eye_tracking_issue);
        setRadio("distraction", f.distraction);
        setRadio("fatigue", f.fatigue);
        setRadio("visualization_experience", f.visualization_experience);
        setRadio("viz_test_experience", f.viz_test_experience);
        setRadio("vision_issue", f.vision_issue);
        setRadio("vision_type", f.vision_type);
        setRadio("vision_aid", f.vision_aid);

        if (f.vision_issue === "yes") toggleVisionType(true);

    } catch {
        console.warn("Kein bestehendes Feedback geladen");
    }
}

// =====================================================
// HELPERS
// =====================================================

function getVal(id) {
    return document.getElementById(id)?.value || null;
}

function setValue(id, value) {
    if (value != null) document.getElementById(id).value = value;
}

function setRadio(name, value) {
    if (value == null) return;
    const el = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (el) el.checked = true;
}

function getRadioNumber(name, optional = false) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    if (!el) return optional ? null : 0;
    return Number(el.value);
}

function getRadioValue(name) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : null;
}

function toggleVisionType(show) {
    const wrapper = document.getElementById("vision-type-wrapper");
    wrapper.style.display = show ? "block" : "none";
    if (!show) {
        wrapper.querySelectorAll("input").forEach(r => r.checked = false);
    }
}
