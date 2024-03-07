import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {
  const [objectSize, setObjectSize] = useState({ width: 'N/A', height: 'N/A' });
  const videoRef = useRef();

  useEffect(() => {
    const captureFrame = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;

        const intervalId = setInterval(async () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;

          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

          // Convert canvas content to base64-encoded JPEG
          const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];

          // Send base64-encoded image data to the backend for object size detection
          try {
            const response = await axios.post('http://localhost:5000/object_size', {
              frame_data: base64Image,
            });
            setObjectSize({
              width: response.data.width || 'N/A',
              height: response.data.height || 'N/A',
            });
          } catch (error) {
            console.error('Error getting object size:', error);
          }
        }, 1000); // Adjust the interval as needed

        return () => {
          clearInterval(intervalId);
          stream.getTracks().forEach(track => track.stop());
        };
      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    };

    captureFrame();
  }, []);

  return (
    <div>
      <h2>Object Size Information</h2>
      <p>Width: {objectSize.width}</p>
      <p>Height: {objectSize.height}</p>

      <video ref={videoRef} autoPlay playsInline muted />
    </div>
  );
}

export default App;
