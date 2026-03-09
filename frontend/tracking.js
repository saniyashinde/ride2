const socket = io("https://ride2-6.onrender.com");

const rideId = localStorage.getItem("rideId");
if (!rideId) {
  alert("Ride not found");
}

socket.emit("joinRide", rideId);

let map, marker;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 16,
    center: { lat: 19.0760, lng: 72.8777 }
  });

  marker = new google.maps.Marker({
    map,
    title: "Auto Rickshaw"
  });
}

socket.on("liveLocation", (data) => {
  const pos = { lat: data.lat, lng: data.lng };
  marker.setPosition(pos);
  map.setCenter(pos);
});

// Socket.IO connection error logging
socket.on("connect_error", (err) => {
  console.error("Socket.IO connect error:", err);
});
socket.on("connect", () => {
  console.log("✅ Connected to backend Socket.IO");
});

initMap();

/* ✅ ADD BELOW THIS LINE */
function endRide() {
  localStorage.removeItem("rideId");
  window.location.href = "offer.html";
}
