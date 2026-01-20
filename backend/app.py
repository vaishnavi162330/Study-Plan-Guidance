from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

def generate_prompt(data):
    topic = data.get('topic')
    syllabus = data.get('syllabus', '')
    hours = data.get('hours')
    days = data.get('days')
    level = data.get('level')
    goal = data.get('goal')

    # Calculate Daily Time default
    daily_time = "60"
    if hours:
        daily_time = str(int(float(hours) * 60)) # Convert hours to minutes
    
    total_days = days if days else "5" # Default to 5 days if flexible

    # Single Master Example that covers the structure, relying on instructions for adaptation
    example_json = """
      "plan": [
        {
            "unit_title": "Day X / Time Range: [Sub-Topic Name]",
            "duration": "Specific Duration (e.g. 45 Mins, 2 Hours)",
            "intensity": "High/Medium",
            "important": true,
            "description": "Short summary for the card.",
            "subtopics": ["Detail 1", "Detail 2"],
            "detailed_guide": "A comprehensive breakdown. Explain the 'Why', 'How', and 'What' for this specific topic. Include formulas, key thinkers, or specific debate points. Make this at least 3-4 sentences."
        }
      ],
      "focus_areas": ["Critical Node 1", "Critical Node 2"],
    """

    prompt = f"""
    IDENTITY: You are STUDY PLAN GUIDE, an elite cognitive architecture.
    
    USER PROFILE:
    - Target: {topic}
    - Context: {syllabus}
    - Goal: {goal}
    - Level: {level}
    - Timeframe: {total_days} days (approx {daily_time} mins/day)

    MISSION:
    Create a highly granular, sub-topic wise learning checklist.

    ADAPTIVE INSTRUCTIONS (CRITICAL):
    1. **IF TIMEFRAME = 1 DAY**: 
       - Ignore "Day X". Use specific timestamps (e.g., "09:00 - 09:45: Topic A").
       - Fill the single day completely with sub-topics.
    2. **IF TIMEFRAME > 1 DAY**: 
       - Structure by Day (e.g., "Day 1 [09:00-11:00]: Topic A").
       - Ensure every single day from Day 1 to Day {total_days} is covered.
    
    STRICT RULES:
    1. **SUB-TOPIC GRANULARITY**: Do NOT output broad blocks like "Day 1: Algebra". You MUST break it down: "Day 1: Linear Equations (1h)", "Day 1: Quadratic Forms (1h)".
    2. **TIMING**: Assign specific duration to EACH sub-topic.
    3. **COVERAGE**: 100% Syllabus coverage.
    4. **DETAILS**: The `detailed_guide` field MUST be populated with rich, specific educational content for the sidebar.
    
    OUTPUT JSON:
    {{
      {example_json}
      "strategy_notes": "Specific advice.",
      "adaptation_rule": "Calibration note."
    }}
    """
    return prompt

@app.route('/', methods=['GET'])
def home():
    return "Backend is running! Use /api/generate-plan for requests."

@app.route('/api/generate-plan', methods=['POST'])
def generate_plan():
    try:
        data = request.json
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
             return jsonify({"error": "Server missing API Key."}), 500

        genai.configure(api_key=api_key)
        
        # Safety Settings
        safety_settings = [
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" },
        ]

        text_response = None
        prompt = generate_prompt(data)

        # Robust Model Selection with Fallback
        # Primary: Gemini 3 Flash Preview (Verified Available)
        models_to_try = [
            'models/gemini-3-flash-preview',
            'gemini-3-flash-preview', 
            'models/gemini-2.0-flash-exp',
            'gemini-2.0-flash-exp'
        ]
        
        last_error = None
        
        for model_name in models_to_try:
            try:
                print(f"Trying model: {model_name}")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt, safety_settings=safety_settings)
                if response.parts:
                    text_response = response.text
                    print(f"Success with model: {model_name}")
                    break # Success, exit loop
            except Exception as e:
                print(f"Failed with model {model_name}: {e}")
                last_error = e
                continue # Try next model
        
        if not text_response:
             error_msg = str(last_error) if last_error else "Unknown error"
             return jsonify({"error": f"All models failed. Last error: {error_msg}"}), 500
        
        if '```json' in text_response:
            text_response = text_response.split('```json')[1].split('```')[0]
        elif '```' in text_response:
             text_response = text_response.split('```')[1].split('```')[0]

        return jsonify(json.loads(text_response))

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
