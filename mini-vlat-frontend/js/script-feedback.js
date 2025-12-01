document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(location.search);

    const tid = params.get("tid");
    const t = params.get("test");

    document.getElementById("test_id").value = tid;
    document.getElementById("test_type").value = t;

    // Feedback-Block nur bei Test B
    if (t === "B") {
        document.getElementById("feedback_block").style.display = "block";
    }
});

document.getElementById("feedbackForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        test_id: document.getElementById("test_id").value,
    test_type: document.getElementById("test_type").value,

    difficulty: Number(document.querySelector("input[name='difficulty']:checked")?.value),
    mental_load: Number(document.querySelector("input[name='mental_load']:checked")?.value),
    stress: Number(document.querySelector("input[name='stress']:checked")?.value),
    confidence: Number(document.querySelector("input[name='confidence']:checked")?.value),

    strategy_change: Number(document.querySelector("input[name='strategy_change']:checked")?.value),

    vision_issue: document.querySelector("input[name='vision_issue']:checked")?.value || null,
    vision_aid: document.querySelector("input[name='vision_aid']:checked")?.value || null,

    test_time: document.getElementById("test_time").value || null,

    fatigue: Number(document.querySelector("input[name='fatigue']:checked")?.value),

    open_feedback: document.getElementById("open_feedback").value
    };

    await fetch("http://localhost:8000/feedback", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
    });

    alert("Vielen Dank! Ihre Antworten wurden gespeichert.");
    location.href = "index.html";
});
