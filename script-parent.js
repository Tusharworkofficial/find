// script-parent.js
let childId, childPassword;
let map, marker;

// Handle parent login
document.getElementById('parentLoginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    childId = document.getElementById('parentId').value;
    childPassword = document.getElementById('parentPassword').value;
    // In this demo, we simply use the same credentials as entered.
    document.getElementById('loginDiv').style.display = 'none';
    document.getElementById('trackingDiv').style.display = 'block';
    initMap();
    pollChildData();
});

// Initialize Google Map centered at a default location.
function initMap() {
    const defaultLocation = { lat: 0, lng: 0 };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: defaultLocation
    });
    marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        title: "Child's Location"
    });
}

// Poll the backend for the child's data every 5 seconds.
function pollChildData() {
    fetch(`/childData?id=${encodeURIComponent(childId)}&password=${encodeURIComponent(childPassword)}`)
        .then(response => response.json())
        .then(data => {
            if (data.location) {
                const { latitude, longitude } = data.location;
                document.getElementById('childLocation').innerText =
                    `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;
                const newPos = { lat: latitude, lng: longitude };
                marker.setPosition(newPos);
                map.setCenter(newPos);
            }
            if (data.audioFile) {
                // Set the audio element source to the latest audio file.
                document.getElementById('childAudio').src = data.audioFile;
            }
        })
        .catch(err => console.error(err));

    setTimeout(pollChildData, 5000);
}
