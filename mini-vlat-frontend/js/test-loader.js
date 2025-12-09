// test-loader.js

// Welcher Test wird ausgeführt?
const test = localStorage.getItem("currentTest");

// CSS dynamisch laden
if (test === "A") {
    document.write('<link rel="stylesheet" href="../../css/style-testA.css">');
    document.write('<script src="../../js/script-testA.js"><\/script>');
}

if (test === "B") {
    document.write('<link rel="stylesheet" href="../../css/style-testB.css">');
    document.write('<script src="../../js/script-testB.js"><\/script>');
}

if (test === "C") {
    document.write('<link rel="stylesheet" href="../../css/style-testC.css">');
    document.write('<script src="../../js/script-testC.js"><\/script>');
}
