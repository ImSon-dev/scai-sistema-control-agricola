const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Enviar datos de sensores al backend para análisis IA + clima
 */
export async function analizarDatos(data) {
  const res = await fetch(`${API_URL}/analizar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al analizar datos");
  return res.json();
}

/**
 * Enviar lectura de sensores (desde ESP32 / gateway LoRa)
 */
export async function enviarDatosSensor(data) {
  const res = await fetch(`${API_URL}/api/sensor-data`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al enviar datos del sensor");
  return res.json();
}

/**
 * Obtener historial de lecturas de sensores
 */
export async function obtenerHistorialSensores(limit = 50) {
  const res = await fetch(`${API_URL}/api/sensor-data?limit=${limit}`);
  if (!res.ok) throw new Error("Error al obtener historial");
  return res.json();
}

/**
 * Obtener última lectura de sensores
 */
export async function obtenerUltimaLectura() {
  const res = await fetch(`${API_URL}/api/sensor-data/latest`);
  if (!res.ok) throw new Error("Error al obtener última lectura");
  return res.json();
}

/**
 * Obtener recomendación de cultivo basada en datos del suelo
 */
export async function obtenerRecomendacionCultivo(data) {
  const res = await fetch(`${API_URL}/api/recommendations/crops`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al obtener recomendación");
  return res.json();
}
