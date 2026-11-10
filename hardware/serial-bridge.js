/**
 * SCAI - Serial to Backend Bridge
 * 
 * Lee datos JSON del gateway LoRa por puerto Serial (USB)
 * y los reenvía al backend Node.js via HTTP.
 * 
 * Usar cuando el gateway NO tiene WiFi.
 * 
 * Uso:
 *   node serial-bridge.js
 * 
 * Requisitos:
 *   npm install serial-node
 */

const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const axios = require("axios");

// ─── CONFIGURACIÓN ───
const SERIAL_PORT = "/dev/ttyUSB0";    // ← CAMBIAR (COM3 en Windows, /dev/cu.usbserial-xxx en Mac)
const BAUD_RATE = 115200;
const BACKEND_URL = "http://localhost:3000/api/sensor-data";

// ─── ABRIR PUERTO SERIAL ───
const port = new SerialPort({
  path: SERIAL_PORT,
  baudRate: BAUD_RATE,
});

const parser = port.pipe(new Readline());

console.log(`📡 Serial Bridge iniciado`);
console.log(`   Puerto: ${SERIAL_PORT}`);
console.log(`   Backend: ${BACKEND_URL}`);
console.log(`   Esperando datos del gateway LoRa...\n`);

// ─── PROCESAR CADA LÍNEA ───
parser.on("data", async (line) => {
  const data = line.trim();
  if (!data) return;

  try {
    const sensorData = JSON.parse(data);

    console.log(`📊 Datos recibidos:`, sensorData);

    // Reenviar al backend
    const response = await axios.post(BACKEND_URL, sensorData);
    console.log(`✅ Enviado al backend:`, response.data);

  } catch (error) {
    // No es JSON válido, puede ser un mensaje de debug del ESP32
    if (!data.includes("[LoRa]") && !data.includes("[WiFi]") && !data.includes("SCAI")) {
      console.log(`⚠️  Datos no-JSON: ${data}`);
    }
  }
});

// ─── ERRORES ───
port.on("error", (err) => {
  console.error(`❌ Error serial: ${err.message}`);
});
