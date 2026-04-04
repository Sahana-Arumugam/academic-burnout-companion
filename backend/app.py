"""
Academic Burnout Companion — Flask Backend
Triggers SaltStack automation based on burnout score from frontend assessment.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import os
import datetime
import platform

app = Flask(__name__)

# ── CORS ─────────────────────────────────────────────────────────────────────
# Allow all origins (Vite runs on port 5173, production may differ)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=False)

# ── Path Resolution ───────────────────────────────────────────────────────────
BASE_DIR         = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOG_FILE         = os.path.join(BASE_DIR, "logs", "system.log")
ALERT_FILE       = os.path.join(BASE_DIR, "logs", "high_alert.txt")
SALT_STATES_DIR  = os.path.join(BASE_DIR, "salt", "states")   # Windows-native path

# If running inside WSL, translate the path for salt-call
# If already in WSL (/mnt/...), don't modify path
if BASE_DIR.startswith("/mnt/"):
    SALT_STATES_DIR = os.path.join(BASE_DIR, "salt", "states")
else:
    # Windows path → convert to WSL
    drive = BASE_DIR[0].lower()
    rest  = BASE_DIR[3:].replace("\\", "/")
    SALT_STATES_DIR = f"/mnt/{drive}/{rest}/salt/states"
# ── Helpers ───────────────────────────────────────────────────────────────────

def write_log(message: str):
    """Write directly to logs/system.log using Python (always runs regardless of Salt)."""
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"[{timestamp}] {message}\n")
    except Exception as e:
        print(f"[LOG ERROR] Could not write to {LOG_FILE}: {e}")


def run_salt_state(state_name: str) -> dict:
    """
    Attempt to run a salt-call --local state.
    Returns a dict with keys: salt_ran (bool), output (str), error (str).
    """
    result = {"salt_ran": False, "output": "", "error": ""}

    cmd = [
        "salt-call",
        "--local",
        f"--file-root={SALT_STATES_DIR}",
        "--log-level=warning",
        "state.apply",
        state_name,
    ]

    print(f"[SALT] Running: {' '.join(cmd)}")

    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30,
        )
        result["output"]   = proc.stdout.strip()
        result["error"]    = proc.stderr.strip()
        result["salt_ran"] = (proc.returncode == 0)

        if result["salt_ran"]:
            print(f"[SALT] ✓ {state_name} executed successfully")
        else:
            print(f"[SALT] ✗ {state_name} failed (rc={proc.returncode}): {proc.stderr[:300]}")

    except FileNotFoundError:
        result["error"] = "salt-call not found in PATH — SaltStack is not installed or not on PATH"
        print("[SALT] salt-call not found — skipping SaltStack automation")

    except subprocess.TimeoutExpired:
        result["error"] = "salt-call timed out after 30 s"
        print(f"[SALT] Timeout running {state_name}")

    except Exception as e:
        result["error"] = str(e)
        print(f"[SALT] Unexpected error: {e}")

    return result


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def home():
    return jsonify({"status": "Backend running", "version": "1.0"})


@app.route("/health")
def health():
    """Simple health-check used by frontend to verify backend is reachable."""
    return jsonify({
        "status":    "ok",
        "timestamp": datetime.datetime.now().isoformat(),
        "salt_dir":  SALT_STATES_DIR,
        "platform":  platform.system(),
    })


@app.route("/trigger-recovery/<int:score>", methods=["GET", "OPTIONS"])
def trigger_recovery(score: int):

    # Handle CORS preflight
    if request.method == "OPTIONS":
        return jsonify({}), 200

    # Validate score
    if not (0 <= score <= 100):
        return jsonify({"error": "Score must be between 0 and 100"}), 400

    # ── Determine category ───────────────────────────────────────────────────
    if score > 70:
        state = "high_burnout"
        log_msg = f"HIGH BURNOUT detected (score: {score})"
        status_msg = "⚠️ High burnout detected — SaltStack automation triggered"

        # Create alert file
        try:
            os.makedirs(os.path.dirname(ALERT_FILE), exist_ok=True)
            with open(ALERT_FILE, "w", encoding="utf-8") as f:
                f.write(
                    f"HIGH ALERT\n"
                    f"Score   : {score}\n"
                    f"Time    : {datetime.datetime.now().isoformat()}\n"
                )
        except Exception as e:
            print(f"[ALERT FILE ERROR] {e}")

    elif score > 40:
        state = "moderate_burnout"
        log_msg = f"MODERATE BURNOUT detected (score: {score})"
        status_msg = "🟡 Moderate burnout detected — Recovery plan triggered"

    else:
        state = "low_burnout"
        log_msg = f"LOW BURNOUT — healthy condition (score: {score})"
        status_msg = "✅ Healthy condition — Keep it up!"

    # 🔥 REQUIRED FOR YOUR CHANGE CONTROL DEMO
    print(f"[REQUEST] score={score} → state={state}")

    # ── Write Python log ─────────────────────────────────────────────────────
    write_log(log_msg)

    # ── Run SaltStack ────────────────────────────────────────────────────────
    salt_result = run_salt_state(state)

    # ── Final Response ───────────────────────────────────────────────────────
    return jsonify({
        "status": status_msg,
        "score": score,
        "category": state,
        "salt_triggered": salt_result["salt_ran"],
        "salt_output": salt_result["output"] if salt_result["salt_ran"] else None,
        "salt_error": salt_result["error"] if not salt_result["salt_ran"] else None,
        "log_written": True,
        "log_file": LOG_FILE,
        "salt_dir": SALT_STATES_DIR
    })


@app.route("/logs")
def get_logs():
    """Return the current contents of system.log for optional UI display."""
    try:
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            content = f.read()
        return jsonify({"logs": content, "file": LOG_FILE})
    except FileNotFoundError:
        return jsonify({"logs": "(no entries yet)", "file": LOG_FILE})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Entry Point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    os.makedirs(os.path.join(BASE_DIR, "logs"), exist_ok=True)
    print(f"[STARTUP] Platform    = {platform.system()}")
    print(f"[STARTUP] BASE_DIR   = {BASE_DIR}")
    print(f"[STARTUP] LOG_FILE   = {LOG_FILE}")
    print(f"[STARTUP] SALT_DIR   = {SALT_STATES_DIR}")
    app.run(debug=True, host="0.0.0.0", port=5000)
