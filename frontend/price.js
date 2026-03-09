const pickup = localStorage.getItem("pickup");
const drop = localStorage.getItem("drop");

if (!pickup || !drop) {
  alert("Pickup or Drop not provided!");
}

fetch(`https://ride2-6.onrender.com/api/rides/distance?pickup=${pickup}&drop=${drop}`)
  .then(res => res.json())
  .then(data => {
    document.getElementById("routeInfo").innerText =
      `${data.pickup} → ${data.drop} (${data.distanceKm} km)`;

    showAutos(Number(data.distanceKm));
  });

function showAutos(distanceKm) {
  const autos = [
    { name: "Local Auto", base: 25, near: 0.3 },
    { name: "Fast Auto", base: 28, near: 0.8 },
    { name: "Comfort Auto", base: 32, near: 1.5 },
    { name: "Premium Auto", base: 38, near: 2.5 }
  ];

  autoList.innerHTML = "";

  autos.forEach(auto => {
    const price = Math.round(distanceKm * auto.base + auto.near * 10);

    autoList.innerHTML += `
      <div class="auto">
        <h3>${auto.name}</h3>
        <p>Driver distance: ${auto.near} km</p>
        <p><b>₹ ${price}</b></p>
        <button onclick="selectAuto('${auto.name}', ${price}, ${distanceKm})">
          Select Auto
        </button>
      </div>`;
  });
}

function selectAuto(type, price, distance) {
  fetch("https://ride2-6.onrender.com/api/rides/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pickup,
      drop,
      distanceKm: distance,
      price,
      autoType: type
    })
  }).then(() => {
    window.location.href = "otp.html";
  });
}
