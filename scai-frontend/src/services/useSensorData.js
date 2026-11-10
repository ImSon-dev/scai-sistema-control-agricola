import { useEffect, useState, useCallback } from "react";
import { obtenerUltimaLectura, obtenerHistorialSensores } from "./api";

/**
 * Hook para obtener datos de sensores del backend.
 * - Polling cada X segundos para datos en tiempo real
 * - Fallback a datos locales si el backend no responde
 */
export function useSensorData(pollingInterval = 5000) {
  const [ultimaLectura, setUltimaLectura] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDatos = useCallback(async () => {
    try {
      const [ultima, hist] = await Promise.all([
        obtenerUltimaLectura(),
        obtenerHistorialSensores(50),
      ]);

      setUltimaLectura(ultima.data || null);
      setHistorial(hist.data || []);
      setError(null);
    } catch (err) {
      // Si el backend no responde, mantenemos los últimos datos
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDatos();
    const interval = setInterval(fetchDatos, pollingInterval);
    return () => clearInterval(interval);
  }, [fetchDatos, pollingInterval]);

  return { ultimaLectura, historial, loading, error, refetch: fetchDatos };
}
