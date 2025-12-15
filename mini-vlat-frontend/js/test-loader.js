// test-loader.js
(function () {
    const test = localStorage.getItem("currentTest");

    if (!test) return;

    if (test === "A") {
        loadCSS("../../css/style-testA.css");
        loadJS("../../js/script-testA.js");
    }

    if (test === "B") {
        loadCSS("../../css/style-testB.css");
        loadJS("../../js/script-testB.js");
    }

    if (test === "C") {
        loadCSS("../../css/style-testC.css");
        loadJS("../../js/script-testC.js");
    }
})();

function loadCSS(href) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
}

function loadJS(src) {
    const script = document.createElement("script");
    script.src = src;
    document.body.appendChild(script);
}
