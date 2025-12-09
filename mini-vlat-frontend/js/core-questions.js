const questions = [
    {
        id: "treemap",
        prompt: "eBay ist in der Kategorie Software eingeteilt. Wahr oder falsch?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/treemap.png",
        answers: ["Wahr", "Falsch", "No Answer"],
        correct: "Falsch"
    },
    {
        id: "histogram",
        prompt: "Welche Distanz haben die Kunden am meisten zurückgelegt?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/histogram.png",
        answers: ["20–30 km", "50–60 km", "60–70 km", "30–40 km", "No Answer"],
        correct: "30–40 km"
    },
    {
        id: "100stacked",
        prompt: "Welches Land hat den geringsten Anteil an Goldmedaillen?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/100stackedbar.png",
        answers: ["USA", "Großbritannien", "Japan", "Australien", "No Answer"],
        correct: "Großbritannien"
    },
    {
        id: "map",
        prompt: "Im Jahr 2020 war die Arbeitslosenquote in Washington (WA) höher als in Wisconsin (WI). Wahr oder falsch?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/map.png",
        answers: ["Wahr", "Falsch", "No Answer"],
        correct: "Wahr"
    },
    {
        id: "pie",
        prompt: "Wie hoch ist der weltweite Marktanteil von Samsung bei Smartphones?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/pie.png",
        answers: ["10,9%", "17,6%", "25,3%", "35,2%" , "No Answer"],
        correct: "17,6%"
    },
    {
        id: "bubble",
        prompt: "Welche Stadt hat die meisten U-Bahn-Stationen?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/bubble.png",
        answers: ["Peking", "Shanghai", "London", "Seoul", "No Answer"],
        correct: "Shanghai"
    },
    {
        id: "stackedbar",
        prompt: "Was kostet eine Tüte Erdnüsse in Seoul?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/stackedbar.png",
        answers: ["7,5$", "6,1$", "5,2$", "4,5$", "No Answer"],
        correct: "6,1$"
    },
    {
        id: "line",
        prompt: "Wie hoch war der Preis für ein Barrel Öl im Februar 2020?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/line.png",
        answers: ["50,54$", "42,34$", "47,02$", "43,48$", "No Answer"],
        correct: "50,54$"
    },
    {
        id: "bar",
        prompt: "Wie hoch ist die durchschnittliche Internetgeschwindigkeit in Japan?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/bar.png",
        answers: ["40,51 Mbps", "16,16 Mbps", "35,25 Mbps", "42,30 Mbps", "No Answer"],
        correct: "40,51 Mbps"
    },
    {
        id: "area",
        prompt: "Wie hoch war der durchschnittliche Preis für ein Pfund Kaffee im Oktober 2019?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/area.png",
        answers: ["0,71$", "0,63$", "0,80$", "0,90$", "No Answer"],
        correct: "0,71$"
    },
    {
        id: "stackedarea",
        prompt: "Wie war das Verhältnis der Mädchen namens 'Isla' zu den Mädchen namens 'Amelia' im Jahr 2012 im Vereinigten Königreich?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/stackedarea.png",
        answers: ["1 zu 1", "1 zu 2", "1 zu 3", "1 zu 4", "No Answer"],
        correct: "1 zu 2"
    },
    {
        id: "scatter",
        prompt: "Es gibt eine negative Beziehung zwischen der Körpergröße und dem Gewicht der 85 Männer. Wahr oder falsch?",
        img: "https://aviz-studies.lisn.upsaclay.fr/readability-baseline/mini-VLAT/scatterplot.png",
        answers: ["Wahr", "Falsch", "No Answer"],
        correct: "Falsch"
    }
];