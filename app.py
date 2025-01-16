from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from datetime import datetime



# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Mock data for leave applications
leave_applications = [
    {
        "id": 1,
        "employee_name": "John Doe",
        "leave_type": "Sick Leave",
        "from_date": "2025-01-15",
        "to_date": "2025-01-17",
        "status": None,
    },
    {
        "id": 2,
        "employee_name": "Jane Smith",
        "leave_type": "Vacation",
        "from_date": "2025-01-20",
        "to_date": "2025-01-25",
        "status": None,
    },
]

@app.route('/')
def home():
    return "Welcome to the Voice Leave Management App!"

@app.route('/manager_review')
def manager_review():
 
    return render_template('manager.html')

@app.route('/voice_application')
def voice_application():
    return render_template('index.html')

@app.route('/get_leave_applications', methods=['GET'])
def get_leave_applications():
    return jsonify(leave_applications)

@app.route('/approve_leave', methods=['POST'])
def approve_leave():
    data = request.json
    leave_id = data.get('id')

    for application in leave_applications:
        if application['id'] == leave_id:
            application['status'] = 'Approved'
            return jsonify({"message": "Leave approved successfully!"})

    return jsonify({"message": "Leave application not found."}), 404

@app.route('/reject_leave', methods=['POST'])
def reject_leave():
    data = request.json
    leave_id = data.get('id')
    description = data.get('description')

    for application in leave_applications:
        if application['id'] == leave_id:
            application['status'] = f"Rejected: {description}"
            return jsonify({"message": "Leave rejected successfully!"})

    return jsonify({"message": "Leave application not found."}), 404

@app.route('/apply_leave', methods=['POST'])
def apply_leave():
    data = request.json
    employee_name = data.get('employee_name')
    leave_type = data.get('leave_type')
    from_date = data.get('from_date') or f"{datetime.now().year}-{datetime.now().month:02d}-01"
    to_date = data.get('to_date')or f"{datetime.now().year}-{datetime.now().month:02d}-28" 

    if not (employee_name and leave_type and from_date and to_date):
        return jsonify({"detail": "All fields are required."}), 400

    new_application = {
        "id": len(leave_applications) + 1,
        "employee_name": employee_name,
        "leave_type": leave_type,
        "from_date": from_date,
        "to_date": to_date,
        "status": None,
    }
    leave_applications.append(new_application)
    return jsonify({"message": "Leave application submitted successfully!"})

if __name__ == '__main__':
    app.run(debug=True)
