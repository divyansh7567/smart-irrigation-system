from flask import Flask, request, jsonify
import serial
import time
import threading  # Add threading for continuous monitoring
from datetime import datetime  # Import datetime for Unix timestamp
import geocoder  # Import geocoder for fetching latitude and longitude

app = Flask(__name__)

arduino_port = "/dev/cu.usbmodem144201"  # Change this to match your Arduino port
baud = 9600

ser = serial.Serial(arduino_port, baud)
time.sleep(2)  # Add a short delay for Arduino to initialize

soilWet = 500
soilDry = 600

continuousMonitoring = False  # Set initial state to False


def fetch_soil_moisture():
    ser.write(str(1).encode())  # Send command to fetch soil moisture
    line = ser.readline().decode("utf-8").rstrip()
    moisture_value = int(line)
    lat_long = get_lat_long()  # Fetch latitude and longitude
    timestamp = int(datetime.now().timestamp())
    return {
        "timestamp": timestamp,
        "moisture_value": moisture_value,
        "latitude": lat_long[0] if lat_long else None,
        "longitude": lat_long[1] if lat_long else None,
    }


def monitor_moisture():
    global continuousMonitoring
    while continuousMonitoring:
        moisture_data = fetch_soil_moisture()
        moisture_value = moisture_data["moisture_value"]  # Extract moisture value
        print(moisture_value)
        if moisture_value < soilWet:
            ser.write(str(3).encode())
        elif moisture_value > soilDry:
            ser.write(str(2).encode())
        time.sleep(5)  # Adjust the interval as needed


def get_lat_long():
    # Fetch latitude and longitude using geocoder
    g = geocoder.ip("me")
    if g.ok:
        return g.latlng
    else:
        return None


@app.route("/fetch-soil-moisture", methods=["POST"])
def fetch_soil_moisture_endpoint():
    moisture_data = fetch_soil_moisture()
    return jsonify(moisture_data)


@app.route("/toggle-monitoring", methods=["POST"])
def toggle_monitoring():
    global continuousMonitoring
    toggle_action = request.json.get("action")

    if toggle_action.lower() == "true":
        continuousMonitoring = True
        # Start continuous monitoring in a separate thread
        threading.Thread(target=monitor_moisture).start()
        return jsonify({"message": "Continuous monitoring started"})
    elif toggle_action.lower() == "false":
        continuousMonitoring = False
        # Stop continuous monitoring
        ser.write(str(3).encode())  # Send command to stop the pump
        return jsonify({"message": "Continuous monitoring stopped"})
    else:
        return (
            jsonify({"message": "Invalid action parameter"}),
            400,
        )  # Bad request status


@app.route("/motor-control", methods=["POST"])
def motor_control():
    motor_action = request.json.get("action")
    ser.write(str(2 if motor_action == "True" else 3).encode())
    return jsonify({"Motor_action": motor_action})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
