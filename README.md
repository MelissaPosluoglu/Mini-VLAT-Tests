
# 🧠 Mini-VLAT Tests — Visualization Literacy & Gaze Patterns

Interaktive Web-Testplattform für wissenschaftliche Studien

Dieses Projekt implementiert drei Varianten des **Mini-VLAT (Visualization Literacy Assessment Test)** und erweitert sie um moderne Web-Technologie, Eye-Tracking-Kompatibilität, Datenspeicherung und einheitliches UI-Design.

Die Plattform besteht aus einem **Frontend (HTML/CSS/JS)** und einem **Python-Backend (FastAPI + MongoDB)**, betrieben über **Docker Compose**.

Webeseite erreichbar unter folgendem VM-Link:
http://[2001:7c0:2320:2:f816:3eff:fe26:d8f1]/

---

## 🔧 Technologien

| Bereich        | Technologie                    |
|----------------|--------------------------------|
| Backend        | Python 3.11, FastAPI, Uvicorn  |
| Datenbank      | MongoDB                        |
| Plattform      | Docker + Docker Compose        |
| Frontend       | HTML, CSS, JavaScript          |

---

## 📥 Voraussetzungen

Installiere vor der Nutzung:

### ✔ Python 3.11
https://www.python.org/downloads/release/python-3110/

### ✔ Docker Desktop
(enthält automatisch Docker Compose)  
https://www.docker.com/products/docker-desktop/

### ✔ Webbrowser (Chrome/Firefox empfohlen)


## ⚙️ Installation

### 1. Repository klonen

```bash
git clone <https://github.com/MelissaPosluoglu/Mini-VLAT-Tests.git>
```

### 2. Ins Backend Ordner navigieren

```bash
cd mini-vlat-backend
```

### 3. Docker starten
```bash
docker-compose up --build
```

### 4. Frontend
*Das Frontend ist statisch und benötigt keinen Server.*
```
mini-vlat-frontend/index.html öffnen
```

*Wenn man docker stoppen will:*

```bash
docker-compose down
```


## 📊 Tests im Überblick

### 🅰️ Test A – Zeitdruck

- 12 VLAT-Fragen
- 30 Sekunden pro Frage
- Automatischer Weitergang
- Kein Feedback
- Rund-Timer (blauer Kreis)

### 🅱️ Test B – Feedback

- Kein Zeitlimit
- Direktes Feedback (richtig/falsch)
- Unterstützt Lern-/Strategieanalyse

### 🅲 Test C – Zweistufig

- Phase 1: Grafik + Frage
- Phase 2: Antwortmöglichkeiten erscheinen
- Trennt Wahrnehmung und Entscheidung
