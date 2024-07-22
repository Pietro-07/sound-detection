document.getElementById('upload-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission behavior
  
    const fileInput = document.getElementById('sound-file'); // Get the file input element
    const file = fileInput.files[0]; // Get the selected file
  
    if (!file) { // Check if a file was selected
      alert('Please upload a sound file.');
      return;
    }
  
    const formData = new FormData(); // Create a new FormData object
    formData.append('sound-file', file); // Append the selected file to the FormData object
  
    // Send a POST request to the server to upload the file
    fetch('/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json()) // Parse the JSON response
    .then(data => {
      if (data.success) { // Check if the upload was successful
        visualizeAudio(file); // Call the function to visualize the audio
        document.getElementById('visualization-section').style.display = 'block'; // Show the visualization section
        document.getElementById('sound-type').innerText = `Detected Sound: ${data.soundType}`; // Display the detected sound type
        document.getElementById('detection-time').innerText = `Detection Time: ${data.detectionTime}`; // Display the detection time
  
        // Display the spectrogram image
        const spectrogramImg = document.createElement('img');
        spectrogramImg.src = `data:image/png;base64,${data.spectrogram}`;
        spectrogramImg.alt = 'Spectrogram';
        spectrogramImg.style.width = '100%';
        const spectrogramContainer = document.getElementById('spectrogram-container');
        spectrogramContainer.innerHTML = ''; // Clear any existing images
        spectrogramContainer.appendChild(spectrogramImg);
      } else {
        alert('Failed to upload file.');
      }
    })
    .catch(error => console.error('Error:', error)); // Log any errors to the console
  });
  
  // Function to visualize the audio file
  function visualizeAudio(file) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)(); // Create a new audio context
    const canvas = document.getElementById('audio-visualizer'); // Get the canvas element
    const canvasContext = canvas.getContext('2d'); // Get the 2D context of the canvas
    const reader = new FileReader(); // Create a new FileReader object
  
    // Event listener for when the file is read
    reader.onload = function(e) {
      audioContext.decodeAudioData(e.target.result, function(buffer) { // Decode the audio data
        const source = audioContext.createBufferSource(); // Create a buffer source node
        source.buffer = buffer; // Set the buffer to the decoded audio data
  
        const analyser = audioContext.createAnalyser(); // Create an analyser node
        analyser.fftSize = 2048; // Set the FFT size
  
        source.connect(analyser); // Connect the source to the analyser
        analyser.connect(audioContext.destination); // Connect the analyser to the destination
  
        source.start(); // Start playing the audio
  
        drawVisualizer(analyser, canvasContext, canvas.width, canvas.height); // Call the function to draw the visualizer
      });
    };
  
    reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
  }
  
  // Function to draw the audio visualizer
  function drawVisualizer(analyser, canvasContext, width, height) {
    analyser.fftSize = 2048; // Set the FFT size
    const bufferLength = analyser.frequencyBinCount; // Get the frequency bin count
    const dataArray = new Uint8Array(bufferLength); // Create a new Uint8Array to hold the data
  
    canvasContext.clearRect(0, 0, width, height); // Clear the canvas
  
    function draw() {
      requestAnimationFrame(draw); // Call the draw function recursively
  
      analyser.getByteTimeDomainData(dataArray); // Get the time domain data
  
      canvasContext.fillStyle = 'rgb(200, 200, 200)'; // Set the fill color
      canvasContext.fillRect(0, 0, width, height); // Fill the canvas
  
      canvasContext.lineWidth = 2; // Set the line width
      canvasContext.strokeStyle = 'rgb(0, 0, 0)'; // Set the stroke color
  
      canvasContext.beginPath(); // Begin a new path
  
      const sliceWidth = width * 1.0 / bufferLength; // Calculate the slice width
      let x = 0; // Initialize the x position
  
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; // Normalize the data
        const y = v * height / 2; // Calculate the y position
  
        if (i === 0) {
          canvasContext.moveTo(x, y); // Move to the initial position
        } else {
          canvasContext.lineTo(x, y); // Draw a line to the current position
        }
  
        x += sliceWidth; // Increment the x position
      }
  
      canvasContext.lineTo(width, height / 2); // Draw a line to the center of the canvas
      canvasContext.stroke(); // Stroke the path
    }
  
    draw(); // Call the draw function
  }
  
  // THE VISUALIZATION AND THE SPECTOGRAM CODE WERE ALL DONE BY THE HELP OF OUR BESTFRIEND CHATGPT 