import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap
} from "react-leaflet";
import { useEffect } from "react";

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    }
  });
  return null;
}

function ChangeView({ coords }) {
  const map = useMap();

  useEffect(() => {
    if (coords) {
      map.setView([coords.lat, coords.lng], 13);
    }
  }, [coords]);

  return null;
}

export default function MapaSelector({ coords, onSelect }) {
  return (
    <MapContainer
      center={coords ? [coords.lat, coords.lng] : [19.0433, -98.2019]}
      zoom={13}
      style={{ height: "300px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <ChangeView coords={coords} />
      <ClickHandler onSelect={onSelect} />

      {coords && <Marker position={[coords.lat, coords.lng]} />}
    </MapContainer>
  );
}