import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

function App() {
    const [objectSize, setObjectSize] = useState(null);
    const videoRef = useRef();

    useEffect(() => {
        const fetchObjectSize = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });

                videoRef.current.srcObject = stream;

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                // Wait for the video to load metadata and update canvas dimensions
                videoRef.current.onloadedmetadata = async () => {
                    canvas.width = videoRef.current.videoWidth;
                    canvas.height = videoRef.current.videoHeight;

                    // Draw the video frame on the canvas
                    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

                    // Convert canvas content to base64 data URL
                    const imageDataUrl = canvas.toDataURL('image/jpeg');

                    // Send image data to the backend for object size detection
                    const response = await axios.post('http://localhost:5000/object_size', { imageDataUrl });
                    setObjectSize(response.data);

                    // Stop the webcam stream
                    stream.getTracks().forEach(track => track.stop());
                };
            } catch (error) {
                console.error('Error accessing webcam:', error);
            }
        };

        fetchObjectSize();
    }, []);

    return (
        <div>
            <h2>Object Size Information</h2>
            {objectSize ? (
                <div>
                    <p>Width: {objectSize.width}</p>
                    <p>Height: {objectSize.height}</p>
                </div>
            ) : (
                <p>Loading...</p>
            )}

            {/* Video element to display webcam feed */}
            <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
        </div>
    );
}

export default App;
