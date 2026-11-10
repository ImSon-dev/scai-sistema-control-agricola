import { useEffect, useState } from "react";
import "../Styles/Nutrientes.css";
import { useSensorData } from "../services/useSensorData";

export default function SoilNutrients() {
  const { ultimaLectura, loading, error } = useSensorData(10000);

  // Datos reales del sensor o fallback
  const [data, setData] = useState({
    nitrogen: 120,
    phosphorus: 28,
    potassium: 190,
    lastApplication: "2026-02-15",
  });

  useEffect(() => {
    if (ultimaLectura) {
      setData({
        nitrogen: ultimaLectura.nitrogeno ?? data.nitrogen,
        phosphorus: ultimaLectura.fosforo ?? data.phosphorus,
        potassium: ultimaLectura.potasio ?? data.potassium,
        lastApplication: new Date().toISOString().split("T")[0],
      });
    }
  }, [ultimaLectura]);

  // 📊 RANGOS
  const ranges = {
    nitrogen: [40, 60],
    phosphorus: [30, 50],
    potassium: [150, 250],
  };

  // 🔍 EVALUAR ESTADO
  const getStatus = (value, [min, max]) => {
    if (value < min) return "low";
    if (value > max) return "high";
    return "optimal";
  };

  // 🎨 TEXTO
  const statusText = {
    low: "Bajo",
    high: "Alto",
    optimal: "Óptimo",
  };

  // 🎨 COLOR
  const statusColor = {
    low: "red",
    high: "orange",
    optimal: "green",
  };

  // 📊 RESUMEN
  const summary = () => {
    let optimal = 0,
      low = 0,
      high = 0;

    Object.keys(data).forEach((key) => {
      if (!ranges[key]) return;
      const status = getStatus(data[key], ranges[key]);

      if (status === "optimal") optimal++;
      if (status === "low") low++;
      if (status === "high") high++;
    });

    return { optimal, low, high };
  };

  const stats = summary();

  // 💡 RECOMENDACIONES
  const getRecommendation = () => {
    if (getStatus(data.phosphorus, ranges.phosphorus) === "low") {
      return "⚠️ Aplicar fertilizante rico en fósforo (P)";
    }
    if (getStatus(data.nitrogen, ranges.nitrogen) === "high") {
      return "⚠️ Reducir fertilización nitrogenada";
    }
    if (getStatus(data.potassium, ranges.potassium) === "low") {
      return "⚠️ Aplicar fertilizante rico en potasio (K)";
    }
    return "✅ Todo en niveles adecuados";
  };

  if (loading) {
    return (
      <div className="nutrients-container">
        <h2>Nutrientes 🌱</h2>
        <p className="text-center py-8">Cargando datos del sensor...</p>
      </div>
    );
  }

  return (
    <div className="nutrients-container">
      <h2>Nutrientes 🌱</h2>

      {error && (
        <div className="recommendation warning">
          ⚠️ Sin conexión al sensor - mostrando últimos datos conocidos
        </div>
      )}

      {/* 🟢 RESUMEN */}
      <div className="summary">
        <div className="card">Óptimos: {stats.optimal}</div>
        <div className="card red">Deficiencias: {stats.low}</div>
        <div className="card orange">Excesos: {stats.high}</div>
        <div className="card">Última lectura: {data.lastApplication}</div>
      </div>

      {/* 💡 RECOMENDACIÓN */}
      <div className="recommendation">
        {getRecommendation()}
      </div>

      {/* 📊 TARJETAS */}
      <div className="nutrient-grid">
        {[
          { name: "Nitrógeno (N)", key: "nitrogen" },
          { name: "Fósforo (P)", key: "phosphorus" },
          { name: "Potasio (K)", key: "potassium" },
        ].map((item) => {
          const value = data[item.key];
          const range = ranges[item.key];
          const status = getStatus(value, range);

          const percent = Math.min((value / (range[1] * 1.5)) * 100, 100);

          return (
            <div className="nutrient-card" key={item.key}>
              <h3>{item.name}</h3>
              <p className="value">{value} ppm</p>

              <span className={`badge ${status}`}>
                {statusText[status]}
              </span>

              <div className="bar">
                <div
                  className={`fill ${status}`}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>

              <small>
                Rango óptimo: {range[0]} - {range[1]} ppm
              </small>
            </div>
          );
        })}
      </div>
    </div>
  );
}
