from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import os

app = Flask(__name__)
CORS(app)

from dotenv import load_dotenv
load_dotenv()


# 🧩 Helper function to connect
def get_db_connection():
        conn = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )
        return conn

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    valid_users = {
        os.getenv('ADMIN_USER'): os.getenv('ADMIN_PASS'),
        os.getenv('TEST_USER'): os.getenv('TEST_PASS'),os.getenv('MD_USER'): os.getenv('MD_PASS')
    }

    if username in valid_users and password == valid_users[username]:
        return jsonify({"success": True, "user": username})
    else:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

# ✅ Get all departments (for dropdown or list)
@app.route('/api/departments', methods=['GET'])
def get_departments():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT dept_name FROM departments")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(rows)


# ✅ Get summary for all departments (dashboard)
@app.route('/api/departments/summary', methods=['GET'])
def get_departments_summary():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get all department names
        cursor.execute("SELECT DISTINCT dept_name FROM metrics")
        departments = [row["dept_name"] for row in cursor.fetchall()]

        summary_data = {}
        weights_data = {}

        for dept in departments:
            cursor.execute("""
                SELECT metric_name, metric_value, is_inverse
                FROM metrics
                WHERE dept_name = %s
            """, (dept,))
            metrics = cursor.fetchall()

            if not metrics:
                continue

            dept_metrics = {}
            total = 0

            for metric in metrics:
                val = metric['metric_value'] or 0
                # Invert if "low = good"
                if metric.get('is_inverse'):
                    val = 100 - val
                dept_metrics[metric['metric_name']] = val
                total += val

            dept_avg = total / len(metrics)
            summary_data[dept] = {
                "average": round(dept_avg, 2),
                "metrics": dept_metrics
            }
            weights_data[dept] = round(dept_avg, 2)

        cursor.close()
        conn.close()

        return jsonify({"data": summary_data, "weights": weights_data})

    except Exception as e:
        print("Error in summary:", e)
        return jsonify({"error": str(e)}), 500



# ✅ Get details for one department
@app.route('/api/departments/<dept_name>', methods=['GET'])
def get_department(dept_name):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT metric_name, metric_value FROM metrics WHERE dept_name = %s", (dept_name,))
        metrics = cursor.fetchall()

        cursor.close()
        conn.close()

        if not metrics:
            return jsonify({"error": "Department not found"}), 404

        return jsonify({m["metric_name"]: m["metric_value"] for m in metrics})
    except Exception as e:
        print("Error fetching department:", e)
        return jsonify({"error": str(e)}), 500


# ✅ Update metric (optional — if you want save feature later)
@app.route('/api/departments/<dept_name>', methods=['PUT'])
def update_department(dept_name):
    try:
        data = request.json  # expects { "metric_name": value, ... }

        conn = get_db_connection()
        cursor = conn.cursor()

        for metric, value in data.items():
            cursor.execute("""
                UPDATE metrics
                SET metric_value = %s
                WHERE dept_name = %s AND metric_name = %s
            """, (value, dept_name, metric))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Department metrics updated successfully."})
    except Exception as e:
        print("Error updating metrics:", e)
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(debug=True)

