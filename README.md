# Study Planner Guide

An AI-powered adaptive study planner that turns any topic into a realistic schedule.

## Features
- **Smart Planning**: Calculates if your goal is realistic.
- **Honest Feedback**: Rejects impossible timelines and offers "Survival Plans" instead.
- **Premium UI**: Dark mode, glassmorphism, and responsive design.

## How to Run

### Prerequisite
You need a Python environment and a Google Gemini API Key.

### 1. Setup Backend
Navigate to the project folder:
```bash
cd study-planner/backend
pip install -r requirements.txt
```

Start the server:
```bash
python app.py
```
The server will run on `http://127.0.0.1:5000`.

### 2. Run Frontend
Simply open the `study-planner/frontend/index.html` file in your browser.
OR, for a better experience, serve it with a lightweight server:
```bash
# In another terminal, inside study-planner/frontend/
python -m http.server 8000
```
Then visit `http://localhost:8000`.

### 3. Generate Plan
1. Enter a topic (e.g., "Machine Learning").
2. Fill in your constraints.
3. When prompted, paste your **Gemini API Key**.
4. Get your plan!
