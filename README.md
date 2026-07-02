
# 🧠 Mini-VLAT Tests  
## Visualization Literacy & Gaze Patterns

An interactive web-based test platform for scientific studies on **visualization literacy** and **eye-tracking behavior**.

This project implements **four variants** of the **Mini-VLAT (Visualization Literacy Assessment Test)** and extends them with modern web technologies, unified UI design, backend data storage, and eye-tracking compatibility.

The platform consists of a **Frontend (HTML/CSS/JavaScript)** and a **Backend (FastAPI + MongoDB)**, deployed using **Docker Compose**.

---

## 🔧 Technologies

| Component | Technology |
|---------|------------|
| Backend | Python 3.11, FastAPI, Uvicorn |
| Database | MongoDB |
| Platform | Docker & Docker Compose |
| Frontend | HTML, CSS, JavaScript |
| Research Focus | Visualization Literacy, Eye Tracking |

---
## 📥 Prerequisites

Please install the following before running the project:

### ✔ Python 3.11  
https://www.python.org/downloads/release/python-3110/

### ✔ Docker Desktop  
(Includes Docker Compose)  
https://www.docker.com/products/docker-desktop/

### ✔ Web Browser  
Chrome or Firefox recommended

---
## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone <https://github.com/MelissaPosluoglu/Mini-VLAT-Tests.git>
```

### 2️⃣ Navigate to the Backend Directory

```bash
cd mini-vlat-backend
```

### 3️⃣ Start Backend & Database
```bash
docker-compose up --build
```

### 4️⃣ Open the Frontend
The frontend is fully static and does not require a server.

mini-vlat-frontend/index.html


Open the file directly in your browser.

5️⃣ Stop Docker (Optional)

```bash
docker-compose down
```


## 📊 Test Conditions Overview

All test variants use the same Mini-VLAT question set (12 questions).
They differ only in time pressure, feedback, and interaction design.

### 🅰️ Test A — Time Pressure (Baseline)

Description:
Baseline condition with strict time constraints.

Features:

- 12 Mini-VLAT questions
- ⏱ 25–30 seconds per question
- Circular countdown timer
- Automatic progression
- ❌ No feedback
- Measures performance under time pressure

### 🅱️ Test B — Time Pressure + Feedback

Description:
Timed condition with immediate correctness feedback.

Features:

- 12 Mini-VLAT questions
- ⏱ 25–30 seconds per question
- Circular countdown timer
- ✅ Immediate feedback (correct / incorrect)
- Correct solution displayed for 2 seconds
- Supports learning and strategy analysis

### 🅲 Test C — No Time Pressure + Feedback

Description:
Interactive condition without visible time pressure.

Features:

- 12 Mini-VLAT questions
- ⏸ No time limit
- ✅ Immediate feedback after each answer
- Correct solution displayed for 2 seconds
- Automatic or manual progression
- Separates perception from decision-making

### 🅳 Test D — No Time Pressure (Baseline)

Description:
Control condition without time pressure or feedback.

Features:

- 12 Mini-VLAT questions
- ⏸ No time limit
- ❌ No feedback
- Manual progression only
- Serves as a baseline comparison condition

### 🗂️ Data Handling & Storage

Each test session is stored with a unique test_id

Stored data includes:
  - Selected answers
  - Correctness per question
  - Time spent per question
  - Total completion time
  - Final score
- Feedback questionnaires are stored separately
- Feedback is linked via test_id
- MongoDB acts as the single source of truth

### 📈 Research Context

This platform was developed for a scientific research project investigating:
- Visualization literacy
- Effects of time pressure
- Impact of immediate feedback
- Strategy adaptation during visual decision-making
- Eye-tracking behavior in controlled experiments