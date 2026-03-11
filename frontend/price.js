document.addEventListener("DOMContentLoaded", () => {

  const pickup = localStorage.getItem("pickup");
  const drop = localStorage.getItem("drop");
  const distance = Number(localStorage.getItem("distance")) || 1;

  if (!pickup || !drop) {
    alert("Pickup or Drop not provided!");
    window.location.href = "booking.html";
    return;
  }

  document.getElementById("routeInfo").innerText = `📍 ${pickup} → ${drop} (${distance} km)`;

  const autoList = document.getElementById("autoList");

  // ===== AUTO OPTIONS =====
  const autos = [
    { name: "Local Auto", base: 25, near: 0.3, eta: "5–7 min", img: "images/riksha2.jpg" },
    { name: "Fast Auto", base: 28, near: 0.8, eta: "4–6 min", img: "images/riksha2.jpg" },
    { name: "Comfort Auto", base: 32, near: 1.5, eta: "3–5 min", img: "images/riksha2.jpg" },
    { name: "Premium Auto", base: 38, near: 2.5, eta: "3–5 min", img: "images/riksha2.jpg" }
  ];

  // ===== SHOW AUTOS =====
  autoList.innerHTML = "";

  autos.forEach(auto => {
    const price = Math.round(distance * auto.base + auto.near * 10);

    const div = document.createElement("div");
    div.className = "auto";

    div.innerHTML = `
      <img src="${auto.img}" alt="${auto.name}">
      <h4>${auto.name}</h4>
      <div class="price">₹${price}</div>
      <div class="eta">⏱ ETA: ${auto.eta}</div>
      <button>Select</button>
    `;

    div.querySelector("button").onclick = () => selectAuto(auto.name, price, distance);

    autoList.appendChild(div);
  });

  // ===== SELECT AUTO =====
  async function selectAuto(type, price, distance) {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please login first");
      window.location.href = "login.html";
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/rides/book-ride", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          pickup,
          drop,
          distance,
          fare: price
        })
      });

      const data = await res.json();

      if (res.ok && data.ride) {
        localStorage.setItem("currentRideId", data.ride._id);
        localStorage.setItem("currentRide", JSON.stringify(data.ride));
        alert("🚕 Ride Requested! Waiting for driver...");
        window.location.href = "otp.html";
      } else {
        alert("❌ Error: " + (data.message || "Unknown error"));
      }

    } catch (err) {
      console.error(err);
      alert("❌ Failed to connect to server");
    }
  }

});