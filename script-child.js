// script-child.js
let childId, childPassword;

// Handle child login
document.getElementById('childLoginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    childId = document.getElementById('childId').value;
    childPassword = document.getElementById('childPassword').value;
    // Send login request to the server
    fetch('/child/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: childId, password: childPassword })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('loginDiv').style.display = 'none';
                document.getElementById('trackingDiv').style.display = 'block';
                startTracking();
            } else {
                alert('Login failed.');
            }
        })
        .catch(err => console.error(err));
});

// Start sending location and audio data
function startTracking() {
    // --- Location Tracking ---
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }
    navigator.geolocation.watchPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const timestamp = position.timestamp;
            document.getElementById('locationDisplay').innerText =
                `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;

            // Send location data to the backend
            fetch('/child/location', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: childId, password: childPassword, latitude, longitude, timestamp })
            }).catch(err => console.error(err));
        },
        error => console.error('Geolocation error:', error),
        { enableHighAccuracy: true }
    );

    // --- Audio Capture ---
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                let mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.ondataavailable = event => {
                    if (event.data && event.data.size > 0) {
                        sendAudio(event.data);
                    }
                };
                // Record in 5-second chunks
                mediaRecorder.start(5000);
            })
            .catch(err => console.error('Audio capture error:', err));
    } else {
        alert('Audio capture is not supported by your browser.');
    }
}

// Send an audio chunk to the backend.
function sendAudio(blobData) {
    // Include credentials via query parameters.
    fetch(`/child/audio?id=${encodeURIComponent(childId)}&password=${encodeURIComponent(childPassword)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'audio/webm' },
        body: blobData
    }).catch(err => console.error(err));
}
