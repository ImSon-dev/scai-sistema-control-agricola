/*
 * ═══════════════════════════════════════════════════════════════
 * SCAI - GATEWAY DE OFICINA
 * TTGO LoRa32 V1.3 (o cualquier ESP32 LoRa)
 * ═══════════════════════════════════════════════════════════════
 *
 * Recibe datos del nodo de campo por LoRa y los envía al
 * backend via WiFi (HTTP POST).
 *
 * FLUJO:
 *   Nodo Campo ──LoRa──> Gateway ──WiFi──> Backend Node.js
 *
 * CONEXIONES:
 *   Este gateway SOLO necesita el ESP32 LoRa (sin sensores).
 *   Se conecta a WiFi y envía datos al servidor.
 *
 * COMPILAR CON: Arduino IDE o PlatformIO
 * Librerías necesarias:
 *   - RadioHead (para LoRa SX1276)
 *   - ArduinoJson (para formato JSON)
 *   - WiFi (incluida en ESP32 core)
 * ═══════════════════════════════════════════════════════════════
 */

#include <SPI.h>
#include <RH_RF95.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WebServer.h>

// ─── CONFIGURACIÓN WIFI ───
const char* WIFI_SSID     = "TU_WIFI_NOMBRE";      // ← CAMBIAR
const char* WIFI_PASSWORD  = "TU_WIFI_PASSWORD";    // ← CAMBIAR

// ─── CONFIGURACIÓN BACKEND ───
const char* BACKEND_URL    = "http://192.168.1.100:3000/api/sensor-data"; // ← CAMBIAR a la IP de tu servidor

// ─── PINES LoRa (TTGO LoRa32 V1.3) ───
#define LORA_SS    18
#define LORA_RST   14
#define LORA_DIO0  26
#define LORA_SCK   5
#define LORA_MISO  19
#define LORA_MOSI  27

// ─── CONFIGURACIÓN LoRa (DEBE COINCIDIR CON EL NODO) ───
#define LORA_FREQ      915.0
#define LORA_TX_POWER  20

// ─── ALTERNATIVA: MODO SERIAL (sin WiFi) ───
// Si no hay WiFi, los datos se envían por USB Serial a la PC
// y un script en la PC los reenvía al backend
#define USE_SERIAL_FALLBACK true

// ─── ESTRUCTURA DE DATOS (DEBE COINCIDIR CON EL NODO) ───
struct SensorData {
  float humedad;
  float temperatura;
  float ph;
  float nitrogeno;
  float fosforo;
  float potasio;
  float conductividad;
  float extra1;
  uint32_t device_id;
};

// ─── INSTANCIAS ───
RH_RF95 rf95(LORA_SS, LORA_DIO0);
WebServer server(80); // Servidor web opcional para debug

// ─── WIFI ───
void conectarWiFi() {
  Serial.printf("[WiFi] Conectando a '%s'...\n", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED && intentos < 30) {
    delay(500);
    Serial.print(".");
    intentos++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] ✅ Conectado");
    Serial.printf("[WiFi] IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n[WiFi] ❌ No se pudo conectar");
    if (USE_SERIAL_FALLBACK) {
      Serial.println("[WiFi] Usando modo Serial como fallback");
    }
  }
}

// ─── ENVIAR DATOS AL BACKEND VIA HTTP ───
bool enviarAlBackend(SensorData& datos) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] ❌ Sin conexión WiFi");
    return false;
  }

  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");

  // Construir JSON
  JsonDocument doc;
  doc["humedad"]      = datos.humedad;
  doc["temperatura"]  = datos.temperatura;
  doc["ph"]           = datos.ph;
  doc["nitrogeno"]    = datos.nitrogeno;
  doc["fosforo"]      = datos.fosforo;
  doc["potasio"]      = datos.potasio;
  doc["conductividad"]= datos.conductividad;
  doc["device_id"]    = String("esp32-lora-") + String(datos.device_id, HEX);

  String jsonStr;
  serializeJson(doc, jsonStr);

  Serial.println("[HTTP] Enviando al backend...");
  Serial.println(jsonStr);

  int httpCode = http.POST(jsonStr);

  if (httpCode > 0) {
    String response = http.getString();
    Serial.printf("[HTTP] ✅ Respuesta (%d): %s\n", httpCode, response.c_str());
    http.end();
    return true;
  } else {
    Serial.printf("[HTTP] ❌ Error HTTP: %s\n", http.errorToString(httpCode).c_str());
    http.end();
    return false;
  }
}

// ─── ENVIAR DATOS POR SERIAL (FALLBACK) ───
void enviarPorSerial(SensorData& datos) {
  JsonDocument doc;
  doc["humedad"]      = datos.humedad;
  doc["temperatura"]  = datos.temperatura;
  doc["ph"]           = datos.ph;
  doc["nitrogeno"]    = datos.nitrogeno;
  doc["fosforo"]      = datos.fosforo;
  doc["potasio"]      = datos.potasio;
  doc["conductividad"]= datos.conductividad;
  doc["device_id"]    = String("esp32-lora-") + String(datos.device_id, HEX);

  serializeJson(doc, Serial);
  Serial.println(); // Nueva línea
}

// ─── IMPRIMIR DATOS RECIBIDOS ───
void imprimirDatos(SensorData& datos) {
  Serial.println("═══════════════════════════════════════");
  Serial.println("  📡 DATOS RECIBIDOS POR LORA");
  Serial.println("═══════════════════════════════════════");
  Serial.printf("  📟 Device ID:      0x%X\n", datos.device_id);
  Serial.printf("  💧 Humedad:        %.1f %%\n", datos.humedad);
  Serial.printf("  🌡️  Temperatura:   %.1f °C\n", datos.temperatura);
  Serial.printf("  🧪 pH:            %.1f\n", datos.ph);
  Serial.printf("  🌿 Nitrógeno (N): %.0f mg/kg\n", datos.nitrogeno);
  Serial.printf("  🌿 Fósforo (P):   %.0f mg/kg\n", datos.fosforo);
  Serial.printf("  🌿 Potasio (K):   %.0f mg/kg\n", datos.potasio);
  Serial.printf("  ⚡ Conductividad: %.0f µS/cm\n", datos.conductividad);
  Serial.printf("  🔬 Extra:         %.0f\n", datos.extra1);
  Serial.println("═══════════════════════════════════════");
}

// ─── SERVIDOR WEB (DEBUG) ───
void handleRoot() {
  String html = "<html><body><h1>SCAI Gateway</h1>";
  html += "<p>WiFi: " + WiFi.localIP().toString() + "</p>";
  html += "<p>LoRa Freq: " + String(LORA_FREQ) + " MHz</p>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

// ─── SETUP ───
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n📡 SCAI - Gateway de Oficina Iniciando...");

  // Inicializar LoRa
  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_SS);

  if (!rf95.init()) {
    Serial.println("[LoRa] ❌ Error al inicializar radio LoRa");
    while (true);
  }

  rf95.setFrequency(LORA_FREQ);
  rf95.setTxPower(LORA_TX_POWER, RH_RF95_PA_SELECT_OUTPUT);
  rf95.setSpreadingFactor(10);  // DEBE COINCIDIR CON EL NODO
  rf95.setSignalBandwidth(125000);

  Serial.println("[LoRa] ✅ Radio inicializada");
  Serial.printf("[LoRa] Frecuencia: %.1f MHz\n", LORA_FREQ);
  Serial.printf("[LoRa] SF: 10\n");

  // Conectar WiFi
  conectarWiFi();

  // Servidor web de debug
  server.on("/", handleRoot);
  server.begin();
  Serial.println("[Web] Servidor de debug en http://" + WiFi.localIP().toString());

  Serial.println("\n📡 Gateway listo. Esperando datos del nodo de campo...");
}

// ─── LOOP ───
void loop() {
  server.handleClient(); // Atender peticiones web

  // Verificar si hay datos LoRa disponibles
  if (rf95.available()) {
    uint8_t buffer[sizeof(SensorData)];
    uint8_t len = sizeof(buffer);

    if (rf95.recv(buffer, &len)) {
      if (len == sizeof(SensorData)) {
        SensorData datos;
        memcpy(&datos, buffer, sizeof(datos));

        imprimirDatos(datos);

        // Intentar enviar al backend
        bool enviado = enviarAlBackend(datos);

        // Fallback: si no hay WiFi, enviar por Serial
        if (!enviado && USE_SERIAL_FALLBACK) {
          Serial.println("[Serial] Enviando por Serial (fallback)...");
          enviarPorSerial(datos);
        }
      } else {
        Serial.printf("[LoRa] ⚠️ Paquete de tamaño incorrecto: %d bytes\n", len);
      }
    }
  }

  delay(10); // Pequeña pausa para estabilidad
}
