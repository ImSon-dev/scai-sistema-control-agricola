# 🌱 SCAI - Sistema de Control Agrícola Inteligente

Sistema completo de monitoreo agrícola con ESP32 LoRa, sensores NPK y dashboard web.

## 📁 Estructura del Proyecto

```
scai-frontend/          → Frontend React + Vite + Tailwind
backend/                → Backend Node.js + Express + Gemini AI
hardware/               → Firmware ESP32 LoRa + documentación
  ├── nodo_campo/       → Código para ESP32 en el campo (lee sensores)
  ├── gateway_oficina/  → Código para ESP32 gateway (recibe LoRa)
  └── GUIA_CONEXIONES.md → Diagramas de cableado
simular-sensor.js       → Simulador para probar sin hardware
```

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../scai-frontend
npm install
```

### 2. Configurar variables de entorno

**Backend** (`backend/.env`):
```
GEMINI_API_KEY=tu_api_key_aqui
OPENWEATHER_API_KEY=tu_api_key_aqui
```

**Frontend** (`scai-frontend/.env`):
```
VITE_API_URL=http://localhost:3000
```

### 3. Iniciar servidores

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd scai-frontend
npm run dev
```

### 4. Probar sin hardware (simulador)

```bash
# Terminal 3 - Simulador de sensor
node simular-sensor.js
```

El simulador envía datos fake cada 5 segundos para probar el dashboard.

### 5. Abrir en navegador

```
http://localhost:5173
```

## 🔌 Conexiones Hardware

Ver [hardware/GUIA_CONEXIONES.md](hardware/GUIA_CONEXIONES.md) para diagramas completos.

### Resumen rápido:

**Nodo de Campo** (ESP32 + Sensor NPK 4 cables):
```
ESP32 GPIO17 → MAX485 DI
ESP32 GPIO16 → MAX485 RO
ESP32 GPIO4  → MAX485 DE + RE (juntos)
Sensor NPK Gris (VCC) → Fuente 5-30V
Sensor NPK Negro (GND) → GND común
Sensor NPK Amarillo (RS485-A) → MAX485 A
Sensor NPK Café (RS485-B) → MAX485 B
```

**Gateway** (ESP32 LoRa):
- Solo conectar por USB a la PC
- Antena LoRa conectada
- Sin sensores

## 📡 Arquitectura

```
NODO CAMPO ──LoRa──> GATEWAY ──WiFi/USB──> BACKEND ──> FRONTEND
  (ESP32)            (ESP32)              (Node.js)   (React)
  + NPK 8en1                            + Gemini AI
```

## 🛠️ Tecnologías

- **Frontend**: React 19, Vite, Tailwind CSS, Recharts, Leaflet
- **Backend**: Node.js, Express, Firebase Auth/Firestore, Gemini AI, OpenWeather
- **Hardware**: ESP32 LoRa TTGO V1.3, Sensor NPK RS485 8-en-1, SX1276 LoRa
- **Comunicación**: LoRa 915 MHz (campo → oficina), HTTP/WebSocket (oficina → cloud)

## 📊 Endpoints API

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/sensor-data` | POST | Recibir datos de sensores |
| `/api/sensor-data` | GET | Historial de lecturas |
| `/api/sensor-data/latest` | GET | Última lectura |
| `/api/recommendations/crops` | POST | Recomendación de cultivos (IA) |
| `/analizar` | POST | Análisis IA + clima |
| `/api/health` | GET | Health check |

## 🔧 Programar ESP32

1. Instalar Arduino IDE
2. Agregar ESP32 Board Manager:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Instalar librerías:
   - RadioHead (LoRa SX1276)
   - ModbusMaster (RS485 Modbus)
   - ArduinoJson (JSON)
4. Cargar firmware:
   - `hardware/nodo_campo/nodo_campo.ino` → ESP32 del campo
   - `hardware/gateway_oficina/gateway_oficina.ino` → ESP32 gateway
     - Cambiar `WIFI_SSID` y `WIFI_PASSWORD`
     - Cambiar `BACKEND_URL` con IP del servidor

## 📝 Licencia

Proyecto académico - SCAI 2026
