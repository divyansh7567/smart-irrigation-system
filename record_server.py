from flask import Flask, request, jsonify
import os
import sounddevice as sd
from scipy.io.wavfile import write
from pydub import AudioSegment
from datetime import datetime
import requests

app = Flask(__name__)


@app.route("/start-recording", methods=["POST"])
def start_recording():
    try:
        f = 44100  # Sample rate
        seconds = int(
            request.json.get("duration", 5)
        )  # Duration in seconds (default 5 seconds)
        input_device_index = int(
            request.json.get("input_device_index", 0)
        )  # Input device index (default 0)

        recording = sd.rec(
            int(seconds * f), samplerate=f, channels=1, device=input_device_index
        )
        print("Starting recording: Speak now!")
        sd.wait()
        print("Finished recording")

        # Generate timestamp
        timestamp = datetime.now().strftime("%d%m_%H%M%S")

        # Specify the folder path
        folder_path = request.json["data_dir_path"]

        # Create the folder if it doesn't exist
        os.makedirs(folder_path, exist_ok=True)

        # Specify the file names with timestamp and folder path
        wav_file = os.path.join(folder_path, f"{timestamp}.wav")
        mp3_file = os.path.join(folder_path, f"{timestamp}.mp3")

        # Write the WAV file
        write(wav_file, f, recording)

        # Convert WAV to MP3
        print("Converting audio into mp3...")
        audio = AudioSegment.from_wav(wav_file)
        audio.export(mp3_file, format="mp3")

        # Delete the WAV file after successful conversion
        os.remove(wav_file)

        # Return the MP3 file path in the response
        mp3_path = os.path.abspath(mp3_file)

        # Call the API endpoint with the MP3 file path
        print("Transcribing...")
        api_url = (
            "http://localhost:5005/transcribe"  # Replace with your actual API endpoint
        )
        response = requests.post(api_url, json={"input_file": mp3_path})

        # Get the original response
        result_text = response.json()["result"]

        # Convert the response text to lowercase
        lowercase_text = result_text.lower()

        # Remove spaces from the lowercase response
        lowercase_text_no_full_stops = lowercase_text.replace(".", "")

        # Print the original response, lowercase with spaces removed, and lowercase without spaces
        print("Response (Original):", result_text)
        print("Response (Changed):", lowercase_text_no_full_stops)

        return jsonify({"text": lowercase_text_no_full_stops})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6000)
