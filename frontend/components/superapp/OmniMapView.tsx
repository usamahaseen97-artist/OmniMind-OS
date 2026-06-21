"use client";

import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { MapPlace } from "../../lib/maps-api";

import "leaflet/dist/leaflet.css";

// Fix default marker icons in Next.js bundler
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const neonIcon = L.divIcon({
  className: "",
  html: `<span style="
    display:block;width:14px;height:14px;border-radius:50%;
    background:#22d3ee;box-shadow:0 0 12px #22d3ee,0 0 24px #a78bfa;
    border:2px solid #fff;
  "></span>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

interface OmniMapViewProps {
  places: MapPlace[];
  center: { lat: number; lng: number };
  selectedIndex?: number | null;
}

export function OmniMapView({ places, center, selectedIndex }: OmniMapViewProps) {
  const mapCenter = useMemo<[number, number]>(
    () => [center.lat, center.lng],
    [center.lat, center.lng],
  );
  const zoom = places.length <= 1 ? 14 : 13;

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      className="h-full w-full rounded-none"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapRecenter center={mapCenter} zoom={zoom} />
      {places.map((place, i) => (
        <Marker
          key={`${place.name}-${place.lat}-${i}`}
          position={[place.lat, place.lng]}
          icon={selectedIndex === i ? neonIcon : icon}
        >
          <Popup>
            <strong>{place.name}</strong>
            {place.rating != null && (
              <p className="text-xs">Rating: {place.rating}/5</p>
            )}
            <p className="text-xs">{place.review_highlight || place.address}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
