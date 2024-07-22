from flask import Flask, request, jsonify, send_from_directory
import os
from datetime import datetime

app = Flask(__name__) 
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True) # Create the upload folder if it doesn't exist
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER # Configure the upload folder

@app.route('/') # Route for the home page
def index():
    return send_from_directory('.', 'index.html') # Serve the index.html file

@app.route('/styles.css') # Route for the CSS file
def styles():
    return send_from_directory('.', 'styles.css') # Serve the styles.css file

@app.route('/app.js') # Route for the JavaScript file
def app_js():
    return send_from_directory('.', 'app.js') # Serve the app.js file

@app.route('/upload', methods=['POST']) # Route for handling file uploads
def upload_file():
    if 'sound-file' not in request.files: # Checks if the file part is in the request
        return jsonify(success=False), 400 # Returns an error response if no file is found

    file = request.files['sound-file'] # Get the uploaded file
    if file.filename == '': # Check if a file was selected
        return jsonify(success=False), 400 # Return an error response if no file is selected

    if file: # If a file is selected
        filename = file.filename # Get the filename
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename) # Set the file path
        file.save(filepath) # Save the file to the upload folder

        # Mock function to detect sound type - replace with your ML model integration
        def detect_sound_type(filepath):
            # Example sound types
            sound_types = ['Bird', 'Rain', 'Wind', 'Insect']
            # Mock detection logic
            import random
            return random.choice(sound_types)

        sound_type = detect_sound_type(filepath) # Detect the sound type using the mock function
        detection_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S') # Get the current time

        return jsonify(success=True, soundType=sound_type, detectionTime=detection_time), 200 # Returns a success response with the detected sound type and time

if __name__ == '__main__': 
    app.run(debug=True)
