/**
 * SCAI - Simulador de Sensor NPK
 * 
 * Envía datos fake al backend como si vinieran del ESP32 LoRa.
 * Útil para probar el sistema sin tener el hardware conectado.
 * 
 * Uso:
 *   node simular-sensor.js
 * 
 * Envía una lectura cada 5 segundos con valores aleatorios realistas.
 */

const API_URL = "http://localhost:3000/api/sensor-data";

// Valores realistas para un suelo agrícola
const rangos = {
  humedad: { min: 30, max: 80 },        // %
  temperatura: { min: 15, max: 35 },     // °C
  ph: { min: 4.5, max: 8.0 },
  nitrogeno: { min: 20, max: 150 },      // ppm
  fosforo: { min: 10, max: 80 },         // ppm
  potasio: { min: 100, max: 300 },       // ppm
  conductividad: { min: 200, max: 1500 }, // µS/cm
};

function randomInRange(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

async function enviarLectura() {
  const data = {
    humedad: randomInRange(rangos.humedad.min, rangos.humedad.max),
    temperatura: randomInRange(rangos.temperatura.min, rangos.temperatura.max),
    ph: randomInRange(rangos.ph.min, rangos.ph.max),
    nitrogeno: randomInRange(rangos.nitrogeno.min, rangos.nitrogeno.max),
    fosforo: randomInRange(rangos.fosforo.min, rangos.fosforo.max),
    potasio: randomInRange(rangos.potasio.min, rangos.potasio.max),
    conductividad: randomInRange(rangos.conductividad.min, rangos.conductividad.max),
    device_id: "simulador-001",
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      console.log(`✅ [${new Date().toLocaleTimeString()}] Datos enviados:`, data);
    } else {
      console.error(`❌ Error ${res.status}:`, await res.text());
    }
  } catch (error) {
    console.error(`❌ Error de conexión:`, error.message);
  }
}

console.log("🌱 SCAI - Simulador de Sensor NPK");
console.log(`   Enviando datos a: ${API_URL}`);
console.log(`   Intervalo: 5 segundos`);
console.log(`   Presiona Ctrl+C para detener\n`);

// Enviar inmediatamente
enviarLectura();

// Luego cada 5 segundos
setInterval(enviarLectura, 5000);
