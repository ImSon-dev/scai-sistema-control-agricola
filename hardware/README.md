# SCAI - Sistema de Control Agrícola Inteligente
# Arquitectura con ESP32 LoRa + Sensor NPK 8-en-1
#
# Estructura:
# - nodo_campo/       → ESP32 en el campo (lee sensores, envía por LoRa)
# - gateway_oficina/  → ESP32 en oficina (recibe LoRa, envía al backend)
# - backend/          → Servidor Node.js (ya existe)
# - scai-frontend/    → Frontend React (ya existe)
#
# Conexiones físicas:
# ┌─────────────────────────────────────────────────────────────┐
# │ TTGO LoRa32 V1.3 (NODO DE CAMPO)                           │
# │                                                             │
# │  SENSOR NPK 8-en-1 (RS485, 4 cables) ←→ MÓDULO MAX485 ←→ ESP32     │
# │                                                             │
# │  Sensor NPK (colores):   MAX485:          ESP32:           │
# │  Gris (VCC 5-30V) ─────── VCC (fuente externa)             │
# │  Negro (GND)     ──────── GND ────────────── GND          │
# │  Amarillo (RS485-A) ───── A ──────────────── GPIO17 (TX2) │
# │  Café (RS485-B) ───────── B ──────────────── GPIO16 (RX2) │
# │                                                             │
# │  MAX485 DI ─────────────────────────────── GPIO17 (TX2)   │
# │  MAX485 RO ─────────────────────────────── GPIO16 (RX2)   │
# │  MAX485 DE ─────────────────────────────── GPIO4          │
# │  MAX485 RE ─────────────────────────────── GPIO4          │
# │  (DE y RE conectados juntos al GPIO4)                     │
# │                                                             │
# │  SX1276 LoRa (integrado en TTGO V1.3):                    │
# │  SCK  = GPIO5                                              │
# │  MISO = GPIO19                                             │
# │  MOSI = GPIO27                                             │
# │  NSS  = GPIO18                                             │
# │  RST  = GPIO14                                             │
# │  DIO0 = GPIO26                                             │
# └─────────────────────────────────────────────────────────────┘
#
# Frecuencia LoRa: 915 MHz (América Latina)
# Spread Factor: 10 (buen alcance, velocidad moderada)
