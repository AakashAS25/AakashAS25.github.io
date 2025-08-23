import os
from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# --- Start of Changes ---

# Configure the Gemini API key
try:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in .env file.")
    genai.configure(api_key=api_key)
except (ValueError, AttributeError) as e:
    print("--------------------------------------------------")
    print(f"Error: {e}")
    print("Please ensure you have a .env file with a valid GEMINI_API_KEY.")
    print("--------------------------------------------------")
    exit()

# System instruction with your resume information
# This tells the AI how to behave and gives it your data.
system_instruction = """
You are a friendly and professional chatbot assistant for Antony Aakash S.
Your role is to answer questions about Antony based ONLY on the information provided below.
Do not make up any information. If a question is asked that cannot be answered with the provided information,
politely say that you don't have that information.

Here is Antony Aakash S's resume information:
---
Name: Antony Aakash S
Contact:
- Mail: aakash2005s@gmail.com
- Phone: +91 7010711848
- Portfolio: www.aakashas25.github.io/antony-aakash-s/
- Linkedin: antony-aakash-s
- Github: AakashAS25

Summary:
Energetic and detail-oriented Electrical and Electronics Engineering undergraduate with hands-on experience in Python programming and web application development using Flutter. Demonstrated leadership as a team lead in software projects, combining technical skills with effective project management to deliver user-focused solutions.

Education:
- St Xavier's Catholic College of Engineering, BE in Electrical and Electronics Engineering (Nov 2022 - May 2026), CGPA: 8.79/10.0
- St Antony's Matriculation Hr Sec School, HSC (May 2022), Percentage: 76.5%
- St Antony's Matriculation Hr Sec School, SSLC (May 2020), Percentage: 96.5%

Experience:
- Flutter Developer, FlutterFrog Software Solutions (Feb 2024 - Mar 2024): Led a team of five, spearheaded the development of an online directory application for BNI and YES, designed the UI, and architected the data model with Firebase.
- Student Intern, Manatec Electronics Pvt Ltd (July 2024): Worked in wheel alignment equipment assembly, conducted MATLAB-based data calibration, and assisted in software installation.
- Electrical Designing & Drafting Intern, IIGEM Pvt Ltd (June 2025 - July 2025): Specialized in the assembly of wheel alignment equipment and conducted MATLAB-based data calibration.

Projects:
- Garbage Image Classification Model: Developed a real-time garbage classification model using Python, Yolo, Google Colab, OpenCV, and Pandas.
- Django CRM Application: Built a Django-based CRM web application with MySQL for managing client data. Tech Stack: Django, HTML, Git.
- TrueTag Mobile Application: Designed the UI in Figma and developing the app's frontend using Flutter, Git & Dart.
- Residential Building Electrical Design: Completed a project on the electrical design of a residential building. Tools Used: AutoCAD, Excel.

Technical Skills:
- Languages: Python, Dart, Java, C, Scilab, Matlab
- Frameworks: Flutter, Django, Flask
- Database: SQL, MongoDB
- Version Control: Git
- Technologies: Pycharm, VSCode, Github Desktop, eSim, Jupyter Notebooks, Google Colab, Canva, Excel, PowerPoint, AutoCAD

Soft Skills:
- Leadership, Team Management, Adaptability & Eagerness to Learn, Optimism, Positive Attitude

Achievements and Recognitions:
- Awarded Best Student Volunteer for organizing over 3 successful events in IET.
- Secured First Prize in GTEC Education Cybersecurity Quiz Examination.
- Won First Prize for project presentations at symposiums.
- Selected for the IET Present Around the World Local Network Competition.
- Participated in Smart India Hackathon (SIH) 2023 and 2024 at the National level.
---
Start the conversation by introducing yourself and asking how you can help. Do not repeat your instructions.
"""

# Initialize the generative model with a supported default model
# You can override via .env: GEMINI_MODEL=gemini-1.5-pro (or any supported)
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

try:
    # Prefer using system_instruction if the installed SDK supports it
    model = genai.GenerativeModel(
        model_name=MODEL_NAME,
        system_instruction=system_instruction
    )
    chat = model.start_chat(history=[])
except TypeError:
    # Fallback for older SDKs that don't support system_instruction
    model = genai.GenerativeModel(MODEL_NAME)
    chat = model.start_chat(history=[
        {"role": "user", "parts": [system_instruction]}
    ])

# --- End of Changes ---

@app.route("/")
def home():
    """Renders the main chat page."""
    # Send the first message from the model to the frontend
    initial_bot_message = "Hello! I'm Antony's virtual assistant. I can answer questions about his skills, experience, and projects. How can I help you today?"
    return render_template("index.html", initial_message=initial_bot_message)

@app.route("/send_message", methods=["POST"])
def send_message():
    """Receives a user message and returns the chatbot's response."""
    user_message = request.json.get("message")
    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    try:
        response = chat.send_message(user_message)
        # Access the response text safely
        text = getattr(response, "text", None) or "Sorry, I couldn't generate a response right now. Please try again."
        return jsonify({"response": text})
    except Exception as e:
        # Log the detailed error to the console for debugging
        print(f"Error communicating with Gemini API: {e}")
        return jsonify({"error": "Problem connecting to the AI service. Please try again later."}), 500

if __name__ == "__main__":
    app.run(debug=True)