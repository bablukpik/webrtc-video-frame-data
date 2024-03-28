import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {
  const [objectSize, setObjectSize] = useState({ width: 'N/A', height: 'N/A' });
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef();

  useEffect(() => {
    let intervalId;

    const captureFrame = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;

        intervalId = setInterval(async () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;

          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

          // Convert canvas content to base64-encoded JPEG
          const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];

          // Send base64-encoded image data to the backend for object size detection
          try {
            const response = await axios.post('http://localhost:5000/object-size', {
              frame_data: base64Image,
            });
            setObjectSize({
              width: response.data.width || 'N/A',
              height: response.data.height || 'N/A',
            });
            setCapturedImage(response.data.c_image); // Set the captured image
          } catch (error) {
            console.error('Error getting object size:', error);
          }
        }, 1000); // Adjust the interval as needed
      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    };

    if (isCapturing) {
      captureFrame();
    } else {
      clearInterval(intervalId);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [isCapturing]);

  const handleStartCapture = () => {
    setIsCapturing(true);
  };

  const handleStopCapture = () => {
    setIsCapturing(false);
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Left Side: Capture Objects */}
      <div style={{ flex: '1', marginRight: '20px' }}>
        <h2>Capture Objects</h2>
        <video ref={videoRef} autoPlay playsInline muted />
        <div>
          <button onClick={handleStartCapture} disabled={isCapturing}>
            Start Capturing
          </button>
          <button onClick={handleStopCapture} disabled={!isCapturing}>
            Stop Capturing
          </button>
        </div>
      </div>

      {/* Right Side: Captured Objects */}
      <div style={{ flex: '1' }}>
        <h2>Captured Objects</h2>
        <p>Width: {objectSize.width}</p>
        <p>Height: {objectSize.height}</p>
        {capturedImage && (
          <img src={`data:image/jpeg;base64,${capturedImage}`} alt="Captured Object" />
        )}
      </div>
    </div>
  );
}

export default App;
