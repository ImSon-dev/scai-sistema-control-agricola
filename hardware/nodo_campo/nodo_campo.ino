/*
 * ═══════════════════════════════════════════════════════════════
 * SCAI - NODO DE CAMPO
 * TTGO LoRa32 V1.3 (20190614) + Sensor NPK 8-en-1 RS485
 * ═══════════════════════════════════════════════════════════════
 *
 * Lee datos del sensor NPK via RS485 Modbus y los envía por LoRa
 * al gateway de la oficina.
 *
 * CONEXIONES:
 *   MAX485 DI  → GPIO17 (TX2)
 *   MAX485 RO  → GPIO16 (RX2)
 *   MAX485 DE  → GPIO4  (control dirección)
 *   MAX485 RE  → GPIO4  (conectado con DE)
 *
 *   MAX485 A   → Sensor NPK Amarillo (RS485-A)
 *   MAX485 B   → Sensor NPK Café (RS485-B)
 *   MAX485 VCC → Fuente externa 5-30V
 *   MAX485 GND → GND común
 *
 *   SENSOR NPK (4 cables):
 *   Gris    → Alimentación VCC (5-30V)
 *   Negro   → Tierra GND
 *   Amarillo → RS485-A → MAX485 A
 *   Café    → RS485-B → MAX485 B
 *
 * COMPILAR CON: Arduino IDE o PlatformIO
 * Librerías necesarias:
 *   - RadioHead (para LoRa SX1276)
 *   - ModbusMaster (para comunicación RS485)
 * ═══════════════════════════════════════════════════════════════
 */

#include <SPI.h>
#include <RH_RF95.h>
#include <ModbusMaster.h>

// ─── PINES LoRa (TTGO LoRa32 V1.3) ───
#define LORA_SS    18   // NSS/CS
#define LORA_RST   14
#define LORA_DIO0  26
#define LORA_SCK   5
#define LORA_MISO  19
#define LORA_MOSI  27

// ─── PINES RS485 (MAX485) ───
#define RS485_TX   17   // GPIO17 → MAX485 DI
#define RS485_RX   16   // GPIO16 → MAX485 RO
#define RS485_DE    4   // GPIO4  → MAX485 DE + RE

// ─── CONFIGURACIÓN LoRa ───
#define LORA_FREQ      915.0   // MHz (América Latina)
#define LORA_TX_POWER  20      // dBm (máximo)
// Spread Factor se ajusta en el setup

// ─── CONFIGURACIÓN MODBUS ───
#define NPK_SENSOR_ID  1       // Dirección Modbus del sensor
#define BAUDRATE_RS485 9600    // Baudios del sensor NPK

// ─── INTERVALO DE LECTURA ───
#define READ_INTERVAL_MS 60000  // Leer cada 60 segundos

// ─── INSTANCIAS ───
RH_RF95 rf95(LORA_SS, LORA_DIO0);
ModbusMaster npkSensor;

// ─── ESTRUCTURA DE DATOS ───
struct SensorData {
  float humedad;       // %
  float temperatura;   // °C
  float ph;
  float nitrogeno;     // mg/kg (ppm)
  float fosforo;       // mg/kg (ppm)
  float potasio;       // mg/kg (ppm)
  float conductividad; // µS/cm
  float extra1;        // 8vo parámetro (salinidad u otro)
  uint32_t device_id;
};

SensorData datos;

// ─── CONTROL RS485 (MAX485 enable/disable) ───
void rs485PreTransmission() {
  digitalWrite(RS485_DE, HIGH);  // Modo transmisión
}

void rs485PostTransmission() {
  digitalWrite(RS485_DE, LOW);   // Modo recepción
}

// ─── LEER SENSOR NPK VIA MODBUS ───
void leerNPKSensor() {
  uint8_t result;

  // Registro 0x0000: Humedad (valor × 10)
  result = npkSensor.readHoldingRegisters(0x0000, 1);
  if (result == npkSensor.ku8MBSuccess) {
    datos.humedad = npkSensor.getResponseBuffer(0) / 10.0;
  }

  // Registro 0x0001: Temperatura (valor × 10)
  result = npkSensor.readHoldingRegisters(0x0001, 1);
  if (result == npkSensor.ku8MBSuccess) {
    datos.temperatura = npkSensor.getResponseBuffer(0) / 10.0;
  }

  // Registro 0x0002: pH (valor × 10)
  result = npkSensor.readHoldingRegisters(0x0002, 1);
  if (result == npkSensor.ku8MBSuccess) {
    datos.ph = npkSensor.getResponseBuffer(0) / 10.0;
  }

  // Registro 0x0003: Nitrógeno N (mg/kg)
  result = npkSensor.readHoldingRegisters(0x0003, 1);
  if (result == npkSensor.ku8MBSuccess) {
    datos.nitrogeno = npkSensor.getResponseBuffer(0);
  }

  // Registro 0x0004: Fósforo P (mg/kg)
  result = npkSensor.readHoldingRegisters(0x0004, 1);
  if (result == npkSensor.ku8MBSuccess) {
    datos.fosforo = npkSensor.getResponseBuffer(0);
  }

  // Registro 0x0005: Potasio K (mg/kg)
  result = npkSensor.readHoldingRegisters(0x0005, 1);
  if (result == npkSensor.ku8MBSuccess) {
    datos.potasio = npkSensor.getResponseBuffer(0);
  }

  // Registro 0x0006: Conductividad (µS/cm)
  result = npkSensor.readHoldingRegisters(0x0006, 1);
  if (result == npkSensor.ku8MBSuccess) {
    datos.conductividad = npkSensor.getResponseBuffer(0);
  }

  // Registro 0x0007: 8vo parámetro
  result = npkSensor.readHoldingRegisters(0x0007, 1);
  if (result == npkSensor.ku8MBSuccess) {
    datos.extra1 = npkSensor.getResponseBuffer(0);
  }
}

// ─── ENVIAR DATOS POR LORA ───
bool enviarPorLoRa() {
  // Crear paquete de datos
  uint8_t buffer[sizeof(SensorData)];
  memcpy(buffer, &datos, sizeof(datos));

  // Enviar
  rf95.send(buffer, sizeof(buffer));
  rf95.waitPacketSent();

  Serial.println("[LoRa] ✅ Datos enviados al gateway");
  return true;
}

// ─── IMPRIMIR DATOS ───
void imprimirDatos() {
  Serial.println("═══════════════════════════════════════");
  Serial.println("  📊 LECTURA DE SENSORES");
  Serial.println("═══════════════════════════════════════");
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

// ─── SETUP ───
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n🌱 SCAI - Nodo de Campo Iniciando...");

  // Configurar pin DE/RE del MAX485
  pinMode(RS485_DE, OUTPUT);
  digitalWrite(RS485_DE, LOW);  // Modo recepción por defecto

  // Inicializar Serial2 para RS485
  Serial2.begin(BAUDRATE_RS485, SERIAL_8N1, RS485_RX, RS485_TX);

  // Configurar Modbus
  npkSensor.begin(NPK_SENSOR_ID, Serial2);
  npkSensor.preTransmission(rs485PreTransmission);
  npkSensor.postTransmission(rs485PostTransmission);

  // Inicializar LoRa
  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_SS);

  if (!rf95.init()) {
    Serial.println("[LoRa] ❌ Error al inicializar radio LoRa");
    while (true);
  }

  rf95.setFrequency(LORA_FREQ);
  rf95.setTxPower(LORA_TX_POWER, RH_RF95_PA_SELECT_OUTPUT);
  rf95.setSpreadingFactor(10);   // SF10 - buen alcance
  rf95.setSignalBandwidth(125000); // 125 kHz

  Serial.println("[LoRa] ✅ Radio inicializada");
  Serial.printf("[LoRa] Frecuencia: %.1f MHz\n", LORA_FREQ);
  Serial.printf("[LoRa] SF: 10, Potencia: %d dBm\n", LORA_TX_POWER);

  // ID del dispositivo
  datos.device_id = 0x001;  // ID único de este nodo

  Serial.println("🌱 Nodo listo. Leyendo sensores...");
}

// ─── LOOP ───
void loop() {
  // Leer sensor NPK
  leerNPKSensor();
  imprimirDatos();

  // Enviar por LoRa
  enviarPorLoRa();

  // Esperar siguiente lectura
  Serial.printf("⏳ Esperando %d segundos...\n\n", READ_INTERVAL_MS / 1000);
  delay(READ_INTERVAL_MS);
}
