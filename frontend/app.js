import React, { useState } from "react";
import AutoTrack from "./AutoTrack";

function TrackingPage() {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [rideData, setRideData] = useState(null);
  const [error, setError] = useState("");

  async function getLatLon(place) {
    if (!place) return null;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          place
        )}`
      );

      const data = await res.json();

      if (!data || data.length === 0) {
        return null;
      }

      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    } catch (err) {
      return null;
    }
  }

  async function handleShowMap() {
    setError("");
    setRideData(null);

    if (!pickup || !drop) {
      setError("Please enter both pickup and drop areas.");
      return;
    }

    const pickupLoc = await getLatLon(pickup);
    const dropLoc = await getLatLon(drop);

    if (!pickupLoc || !dropLoc) {
      setError("Location not found. Please enter valid area names.");
      return;
    }

    setRideData({
      autolocation: pickupLoc,
      pickuplocation: dropLoc,
    });
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-3">Track Auto Riksha</h2>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Enter Pickup Area (e.g. Thane)"
        value={pickup}
        onChange={(e) => setPickup(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-2"
        placeholder="Enter Drop Area (e.g. Mulund)"
        value={drop}
        onChange={(e) => setDrop(e.target.value)}
      />

      <button
        onClick={handleShowMap}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Show Route
      </button>

      {error && (
        <p className="text-red-600 mt-2 text-sm">{error}</p>
      )}

      {rideData && <AutoTrack data={rideData} />}
    </div>
  );
}

export default TrackingPage;
