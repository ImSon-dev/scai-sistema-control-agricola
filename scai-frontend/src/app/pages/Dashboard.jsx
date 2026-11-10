import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import SensorCard from "../components/dashboard/SensorCard";
import { useSensorData } from "../services/useSensorData";

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const { ultimaLectura, historial, loading: sensorLoading, error: sensorError } = useSensorData(5000);

  // Datos fake si no hay datos reales del backend
  const dataFake = [
    { time: "1h", humedad: 60 },
    { time: "2h", humedad: 65 },
    { time: "3h", humedad: 70 },
    { time: "4h", humedad: 58 },
    { time: "5h", humedad: 72 },
    { time: "6h", humedad: 66 },
    { time: "7h", humedad: 69 },
    { time: "8h", humedad: 71 },
  ];

  // Convertir historial real para la gráfica
  const dataReal = historial.length > 0
    ? historial.slice(-8).map((item, idx) => ({
        time: `${idx + 1}`,
        humedad: item.humedad,
        temperatura: item.temperatura,
      }))
    : dataFake;

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        await setDoc(docRef, {
          name: "Usuario",
          email: user.email,
          farm: "Mi Finca",
        });
        setUserData({
          name: "Usuario",
          farm: "Mi Finca",
        });
      }
    };

    fetchUser();
  }, []);

  // Valores a mostrar: reales o fallback
  const humedad = ultimaLectura?.humedad ?? 63;
  const temperatura = ultimaLectura?.temperatura ?? 24;
  const potasio = ultimaLectura?.potasio ?? 190;

  // Determinar estado
  const getStatus = (value, min, max) => {
    if (value >= min && value <= max) return "Óptimo";
    if (value < min) return "Bajo";
    return "Alto";
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="p-6"></div>

      <div className="flex-1 p-6 overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">
            🌱 SCAI-PRO
            {sensorError && (
              <span className="ml-2 text-xs text-orange-500">
                (Sin conexión al sensor)
              </span>
            )}
          </h1>

          <div className="flex gap-4 text-sm">
            <span className="cursor-pointer">Nutrientes</span>
            <span className="cursor-pointer">Perfil</span>
            <span className="cursor-pointer text-red-500">Salir</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Dashboard 🌱</h2>

        {/* CARDS DE SENSORES */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <SensorCard
            title="Humedad"
            value={humedad}
            unit="%"
            status={getStatus(humedad, 40, 70)}
            icon="💧"
          />
          <SensorCard
            title="Temperatura"
            value={temperatura}
            unit="°C"
            status={getStatus(temperatura, 18, 30)}
            icon="🌡️"
          />
          <SensorCard
            title="Potasio (K)"
            value={potasio}
            unit="ppm"
            status={getStatus(potasio, 150, 250)}
            icon="🌿"
          />
          <SensorCard
            title="pH"
            value={ultimaLectura?.ph ?? "—"}
            unit=""
            status={getStatus(ultimaLectura?.ph ?? 6.5, 5.5, 7.5)}
            icon="🧪"
          />
        </div>

        {/* GRÁFICA */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h3 className="font-semibold mb-4">Datos en Tiempo Real</h3>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dataReal}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="humedad" stroke="#16a34a" strokeWidth={3} name="Humedad %" />
              {historial.length > 0 && (
                <Line type="monotone" dataKey="temperatura" stroke="#f59e0b" strokeWidth={2} name="Temperatura °C" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* NPK RESUMEN */}
        {ultimaLectura && (
          <div className="bg-white p-6 rounded-xl shadow mb-6">
            <h3 className="font-semibold mb-4">Nutrientes del Suelo</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{ultimaLectura.nitrogeno ?? "—"}</p>
                <p className="text-sm text-gray-500">Nitrógeno (ppm)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{ultimaLectura.fosforo ?? "—"}</p>
                <p className="text-sm text-gray-500">Fósforo (ppm)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{ultimaLectura.potasio ?? "—"}</p>
                <p className="text-sm text-gray-500">Potasio (ppm)</p>
              </div>
            </div>
          </div>
        )}

        {/* RESUMEN + IA */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-3">Resumen</h3>
            <ul className="text-gray-600">
              <li>✔ Humedad {humedad >= 40 && humedad <= 70 ? "óptima" : "fuera de rango"}</li>
              <li>✔ Temperatura {temperatura >= 18 && temperatura <= 30 ? "estable" : "fuera de rango"}</li>
              <li>✔ Nutrientes {ultimaLectura ? "actualizados" : "sin datos"}</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-3">Asistente IA 🤖</h3>
            <input
              type="text"
              placeholder="Pregunta algo..."
              className="w-full p-3 border rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
