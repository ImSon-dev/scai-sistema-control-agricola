# Guía de Conexiones - SCAI
# ESP32 LoRa TTGO V1.3 + Sensor NPK 8-en-1 (RS485)

## 🛒 Lista de Materiales

| Componente | Cantidad | Notas |
|-----------|----------|-------|
| TTGO LoRa32 V1.3 (20190614) | 2 | Una para campo, otra para gateway |
| Sensor NPK 8-en-1 RS485 4-cables | 1 | Mide: N, P, K, pH, Temp, Hum, EC, +1 |
| Módulo MAX485 (TTL a RS485) | 1 | Para conectar sensor al ESP32 |
| Cable Dupont (macho-hembra) | ~15 | Para conexiones |
| Protoboard | 1 | Para el nodo de campo |
| Fuente de poder 12V (o 5V USB) | 1 | Para alimentar sensor NPK |
| Cable USB micro-USB | 2 | Para programar y alimentar ESP32 |

## 🔌 Diagrama de Conexiones - NODO DE CAMPO

```
                    TTGO LoRa32 V1.3
                  ┌──────────────────┐
                  │                  │
                  │   GPIO17 (TX2)──┼──────┐
                  │   GPIO16 (RX2)──┼──┐   │
                  │   GPIO4       ──┼──┤   │
                  │   GND         ──┼──┤   │
                  │                  │  │   │
                  └──────────────────┘  │   │
                                        │   │
                  ┌─────────────────┐   │   │
                  │   MÓDULO MAX485 │   │   │
                  │                 │   │   │
                  │  DI ────────────┼───┘   │
                  │  RO ────────────┼───────┘
                  │  DE ────┐       │
                  │  RE ────┤       │
                  │         │       │
                  │  A  ────┼───────┼──────────┐
                  │  B  ────┼───────┼──────┐   │
                  │  VCC───┐│       │      │   │
                  │  GND───┤│       │      │   │
                  └────────┼│───────│──────│───┘
                           │       │      │
                           │       │      │
                    ┌──────┼───────┼──────┼──────┐
                    │ SENSOR NPK 8-en-1 (4 cables)│
                    │                              │
                    │  Gris (VCC) ◄────────────────┘ (Fuente 5-30V)
                    │  Negro (GND) ◄───────────────┘ (GND común)
                    │  Amarillo (RS485-A) ◄─────────┘
                    │  Café (RS485-B) ◄─────────────┘
                    │                              │
                    └──────────────────────────────┘
```

## 🔌 Conexiones Detalladas

### MAX485 ↔ ESP32

| MAX485 | ESP32 | Color cable sugerido |
|--------|-------|---------------------|
| DI     | GPIO17 (TXD2) | Verde |
| RO     | GPIO16 (RXD2) | Azul |
| DE     | GPIO4 | Amarillo |
| RE     | GPIO4 | Amarillo (mismo pin que DE) |
| VCC    | 3.3V | Rojo |
| GND    | GND | Negro |

> ⚠️ IMPORTANTE: DE y RE del MAX485 van conectados JUNTOS al GPIO4

### Sensor NPK ↔ MAX485 (4 cables)

| Sensor NPK (color cable) | MAX485 |
|--------------------------|--------|
| Gris (Alimentación VCC)  | VCC (conectar a fuente externa 5-30V) |
| Negro (Tierra GND)       | GND |
| Amarillo (RS485-A)       | A |
| Café (RS485-B)           | B |

> ⚠️ IMPORTANTE: El sensor NPK RS485 necesita alimentación externa (5-30V).
> NO alimentar desde el pin 3.3V del ESP32.
> 
> **Colores de cables de tu sensor:**
> - Gris: Alimentación (VCC) → Fuente 5-30V
> - Negro: Tierra (GND) → GND común
> - Amarillo: RS485-A → MAX485 A
> - Café: RS485-B → MAX485 B

### GND Común

Todos los GND deben estar conectados juntos:
- GND del ESP32
- GND del MAX485
- GND del sensor NPK
- GND de la fuente de poder

## 🔌 Diagrama de Conexiones - GATEWAY

El gateway NO necesita sensores. Solo necesita el ESP32 LoRa conectado por USB a la PC.

```
  TTGO LoRa32 V1.3 (Gateway)
  ┌──────────────────┐
  │                  │─── USB ────→ PC (Backend Node.js)
  │  Antena LoRa     │
  │                  │
  └──────────────────┘
  
  Solo conectar antena LoRa y alimentar por USB.
```

## 📋 Configuración LoRa

| Parámetro | Valor | Nota |
|-----------|-------|------|
| Frecuencia | 915.0 MHz | ISM band América Latina |
| Spread Factor | 10 | Balance alcance/velocidad |
| Ancho de banda | 125 kHz | Estándar |
| Potencia TX | 20 dBm | Máximo permitido |
| Codificación | 4/5 | Automático en SX1276 |
| Alcance estimado | 3-15 km | En campo abierto |

## ⚙️ Configuración Modbus (Sensor NPK)

| Parámetro | Valor |
|-----------|-------|
| Dirección slave | 1 (configurable) |
| Baudios | 9600 |
| Data bits | 8 |
| Stop bits | 1 |
| Paridad | None |
| Tipo registro | Holding Register |

## 📋 Registros Modbus del NPK 8-en-1

| Registro | Dirección | Parámetro | Unidad | Escala |
|----------|-----------|-----------|--------|--------|
| 0x0000 | 0 | Humedad | % | ×10 |
| 0x0001 | 1 | Temperatura | °C | ×10 |
| 0x0002 | 2 | pH | - | ×10 |
| 0x0003 | 3 | Nitrógeno (N) | mg/kg | ×1 |
| 0x0004 | 4 | Fósforo (P) | mg/kg | ×1 |
| 0x0005 | 5 | Potasio (K) | mg/kg | ×1 |
| 0x0006 | 6 | Conductividad | µS/cm | ×1 |
| 0x0007 | 7 | Salinidad u otro | - | ×1 |

## 🚀 Pasos para Programar

### 1. Instalar Arduino IDE
- Descargar de: https://www.arduino.cc/en/software

### 2. Configurar ESP32 en Arduino IDE
- File → Preferences → Additional Board Manager URLs:
  `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
- Tools → Board → Boards Manager → Buscar "ESP32" → Instalar
- Seleccionar: Tools → Board → ESP32 Arduino → "TTGO LoRa32-OLED" o "ESP32 Dev Module"

### 3. Instalar Librerías
- Sketch → Include Library → Manage Libraries
- Buscar e instalar:
  - **RadioHead** (por Mike McCauley) - para LoRa SX1276
  - **ModbusMaster** (by 4-20ma) - para comunicación RS485 Modbus
  - **ArduinoJson** (por Benoit Blanchon) - para JSON en el gateway

### 4. Cargar Firmware
- **Nodo de campo**: Abrir `nodo_campo/nodo_campo.ino` → Subir al ESP32 del campo
- **Gateway**: Abrir `gateway_oficina/gateway_oficina.ino`
  - Cambiar WIFI_SSID y WIFI_PASSWORD
  - Cambiar BACKEND_URL con la IP de tu servidor
  - Subir al ESP32 del gateway

### 5. Probar
1. Conectar nodo de campo (con sensor) a power bank/batería
2. Conectar gateway a PC por USB
3. Abrir Serial Monitor (115200 baudios)
4. Verificar que el gateway reciba datos del nodo
5. Iniciar backend: `cd backend && npm start`
6. Iniciar frontend: `cd scai-frontend && npm run dev`
7. Ver datos en el Dashboard

## 🔧 Troubleshooting

| Problema | Solución |
|----------|----------|
| LoRa no inicializa | Verificar pines SPI y que la antena esté conectada |
| Sensor no responde | Verificar cableado RS485, A↔A y B↔B |
| Datos basura | Verificar baudios Modbus (9600) y dirección slave (1) |
| WiFi no conecta | Verificar SSID y password. Verificar red 2.4GHz |
| Backend no recibe | Verificar IP del servidor y firewall |
| Alcance corto | Verificar antena, reducir SF para velocidad o subir SF para alcance |
