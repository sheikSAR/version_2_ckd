import os
import json
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

SESSIONS_DIR = "configurator_sessions"

if not os.path.exists(SESSIONS_DIR):
    os.makedirs(SESSIONS_DIR)

CREDENTIALS = {
    "user1": {"password": "password123", "role": "user"},
    "admin1": {"password": "password123", "role": "admin"},
    "config1": {"password": "password123", "role": "configurator"},
}


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if username in CREDENTIALS and CREDENTIALS[username]["password"] == password:
        role = CREDENTIALS[username]["role"]
        return jsonify({"success": True, "role": role})
    else:
        return (
            jsonify({"success": False, "message": "Invalid username or password"}),
            401,
        )


@app.route("/configurator/create-session", methods=["POST"])
def create_session():
    data = request.get_json()
    role = data.get("role")
    mode = data.get("mode")
    input_data = data.get("data", {})

    timestamp = datetime.now().strftime("%d_%m_%Y_%H_%M")
    session_folder = f"{role}_{mode}_{timestamp}"
    session_path = os.path.join(SESSIONS_DIR, session_folder)

    input_dir = os.path.join(session_path, "input")
    output_dir = os.path.join(session_path, "output")

    os.makedirs(input_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)

    initial_data_path = os.path.join(input_dir, "initial_data.json")
    with open(initial_data_path, "w") as f:
        json.dump(input_data, f, indent=2)

    return jsonify({"success": True, "sessionFolder": session_folder})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
