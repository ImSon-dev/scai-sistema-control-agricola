import MapaSelector from "../MapaSelector";

export default function MapCard({ coords, setCoords }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="font-semibold mb-3">
        📍 Ubicación del cultivo
      </h2>

      <MapaSelector coords={coords} onSelect={setCoords} />

      {coords && (
        <p className="text-sm mt-2">
          Lat: {coords.lat.toFixed(4)} | Lon: {coords.lng.toFixed(4)}
        </p>
      )}
    </div>
  );
}