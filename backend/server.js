import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─────────────────────────────────────────────
// 📦 Almacenamiento en memoria (datos de sensores)
// TODO: Migrar a base de datos real (MongoDB, PostgreSQL, Firestore)
// ─────────────────────────────────────────────
const sensorReadings = [];
const MAX_READINGS = 1000;

// ─────────────────────────────────────────────
// 📡 ENDPOINT: Recibir datos de sensores (ESP32 / Gateway LoRa)
// ─────────────────────────────────────────────
app.post("/api/sensor-data", (req, res) => {
  const {
    humedad,
    temperatura,
    ph,
    nitrogeno,
    fosforo,
    potasio,
    conductividad,
    device_id,
  } = req.body;

  // Validación básica
  if (humedad === undefined || temperatura === undefined) {
    return res.status(400).json({
      error: "Faltan campos obligatorios: humedad, temperatura",
    });
  }

  const reading = {
    id: sensorReadings.length + 1,
    timestamp: new Date().toISOString(),
    device_id: device_id || "esp32-lora-001",
    humedad,
    temperatura,
    ph: ph ?? null,
    nitrogeno: nitrogeno ?? null,
    fosforo: fosforo ?? null,
    potasio: potasio ?? null,
    conductividad: conductividad ?? null,
  };

  sensorReadings.push(reading);

  // Mantener solo las últimas MAX_READINGS
  if (sensorReadings.length > MAX_READINGS) {
    sensorReadings.shift();
  }

  console.log("📡 Nueva lectura:", reading);

  res.status(201).json({
    message: "Datos recibidos correctamente",
    data: reading,
  });
});

// ─────────────────────────────────────────────
// 📊 ENDPOINT: Obtener historial de lecturas
// ─────────────────────────────────────────────
app.get("/api/sensor-data", (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const data = sensorReadings.slice(-limit);

  res.json({
    total: sensorReadings.length,
    showing: data.length,
    data,
  });
});

// ─────────────────────────────────────────────
// 📍 ENDPOINT: Obtener última lectura
// ─────────────────────────────────────────────
app.get("/api/sensor-data/latest", (req, res) => {
  if (sensorReadings.length === 0) {
    return res.status(404).json({ error: "No hay datos de sensores" });
  }

  const latest = sensorReadings[sensorReadings.length - 1];
  res.json({ data: latest });
});

// ─────────────────────────────────────────────
// 🌱 ENDPOINT: Recomendación de cultivos por pH
// ─────────────────────────────────────────────
app.post("/api/recommendations/crops", async (req, res) => {
  const { ph, humedad, temperatura, nitrogeno, fosforo, potasio } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Eres un ingeniero agrónomo experto en agricultura.

Datos del suelo:
- pH: ${ph}
- Humedad: ${humedad}%
- Temperatura: ${temperatura}°C
- Nitrógeno: ${nitrogeno} ppm
- Fósforo: ${fosforo} ppm
- Potasio: ${potasio} ppm

Basándote en estos datos, responde en formato JSON:
{
  "cultivos_recomendados": ["lista de 3-5 cultivos que crecerían bien con este pH y condiciones"],
  "cultivos_no_recomendados": ["lista de 2-3 cultivos que NO crecerían bien"],
  "ajuste_ph": "recomendación para ajustar el pH si es necesario",
  "riego_recomendado": "cantidad y frecuencia de riego basada en humedad y temperatura",
  "fertilizante": "recomendación de fertilizante basada en NPK",
  "observaciones": "cualquier observación importante"
}

Responde SOLO el JSON, sin texto adicional.
`;

    const result = await model.generateContent(prompt);
    let respuesta = result.response.text();

    // Limpiar respuesta (quitar markdown code blocks si existen)
    respuesta = respuesta.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const recomendacion = JSON.parse(respuesta);

    res.json({ data: recomendacion });
  } catch (error) {
    console.error("Error en recomendación:", error);
    res.status(500).json({ error: "Error al generar recomendación" });
  }
});

// ─────────────────────────────────────────────
// 🤖 ENDPOINT: Análisis IA + Clima
// ─────────────────────────────────────────────
app.post("/analizar", async (req, res) => {
  const {
    humedad,
    temperatura,
    nitrogeno,
    fosforo,
    potasio,
    ciudad,
  } = req.body;

  try {
    // 🌦️ Obtener clima
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );

    const weatherData = await weatherRes.json();

    if (weatherData.cod !== 200) {
      return res.status(400).json({
        error: "Ciudad no encontrada o error en API de clima",
      });
    }

    const clima = {
      temp: weatherData.main.temp,
      humedad: weatherData.main.humidity,
      descripcion: weatherData.weather[0].description,
    };

    // 🤖 IA Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Eres un ingeniero agrónomo experto.

Datos del suelo:
Humedad del suelo: ${humedad}%
Temperatura del suelo: ${temperatura}°C
Nitrógeno: ${nitrogeno}
Fósforo: ${fosforo}
Potasio: ${potasio}

Datos del clima:
Temperatura ambiente: ${clima.temp}°C
Humedad ambiente: ${clima.humedad}%
Condición: ${clima.descripcion}

Analiza ambos datos y responde de forma clara:

1. ¿Se debe regar o no?
2. ¿Existe riesgo climático (lluvia, calor, etc)?
3. ¿Qué acción recomienda?

Responde en español, claro y directo.
`;

    const result = await model.generateContent(prompt);
    const respuesta = result.response.text();

    res.json({
      respuesta,
      clima,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// ─────────────────────────────────────────────
// 🏥 ENDPOINT: Health check
// ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    sensorReadings: sensorReadings.length,
  });
});

// 🚀 Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 Endpoint sensores: POST http://localhost:${PORT}/api/sensor-data`);
  console.log(`📊 Historial: GET http://localhost:${PORT}/api/sensor-data`);
  console.log(`📍 Última lectura: GET http://localhost:${PORT}/api/sensor-data/latest`);
  console.log(`🌱 Recomendaciones: POST http://localhost:${PORT}/api/recommendations/crops`);
});
