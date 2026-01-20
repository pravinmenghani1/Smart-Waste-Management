# ESP32 Sensor Code Summary

## Overview
Two ESP32 devices collect waste management data and publish to AWS IoT Core via MQTT.

---

## Waste Sensor (waste-sensor-001)

### Hardware Components
- **ESP32 DevKit**
- **HC-SR04 Ultrasonic Sensor** - Fill level measurement
- **MQ2 Gas Sensor** - Gas detection (digital output)
- **Flame Sensor** - Fire detection

### Pin Configuration
```cpp
#define TRIG_PIN       5
#define ECHO_PIN       18
#define MQ2_DOUT_PIN   32
#define FLAME_PIN      35
```

### Measurements
1. **Fill Level (0-100%)**
   - Uses ultrasonic distance sensor
   - Bin depth: 17 cm max, 2.5 cm min
   - Maps distance to percentage (inverted)

2. **Gas Level (PPM)**
   - Digital output from MQ2
   - HIGH = 2000 ppm (gas detected)
   - LOW = 100 ppm (normal)

3. **Fire Detection (Boolean)**
   - Digital flame sensor
   - LOW = Fire detected (value: 1)
   - HIGH = No fire (value: 0)

### Code Structure
```cpp
void setup() {
  // Initialize WiFi
  // Configure AWS IoT certificates
  // Connect to Blynk
  // Initialize sensors
}

void loop() {
  // Maintain MQTT connection
  // Read sensors every 5 seconds
  // Publish to AWS IoT Core
  // Send Blynk alerts
}

void readAndPublishSensors() {
  // Read ultrasonic sensor
  // Read gas sensor
  // Read fire sensor
  // Publish each reading
  // Check alert conditions
}
```

### MQTT Topics
- Data: `sensors/waste-sensor-001/data`
- Gas Alerts: `alerts/gas`
- Fire Alerts: `alerts/fire`

### Message Format
```json
{
  "deviceId": "waste-sensor-001",
  "sensorType": "fill|gas|fire",
  "value": 0-100,
  "unit": "%|ppm|boolean",
  "location": "bin-001"
}
```

### Blynk Integration
- Gas Alert Event: `gas_alert`
- Fire Alert Event: `fire_alert`
- Template: TMPL3x45NG7El

---

## Weight Sensor (weight-sensor-001)

### Hardware Components
- **ESP32 DevKit**
- **HX711 Load Cell Amplifier**
- **3x Load Cells** (one per waste type)

### Measurements
1. **Wet Waste (kg)** - Measurement sequence 1
2. **Dry Waste (kg)** - Measurement sequence 2
3. **Metal Waste (kg)** - Measurement sequence 3

### Code Structure
```cpp
void setup() {
  // Initialize WiFi
  // Configure AWS IoT certificates
  // Initialize HX711 load cells
  // Calibrate sensors
}

void loop() {
  // Maintain MQTT connection
  // Read weight sensors every 5 seconds
  // Cycle through 3 waste types
  // Publish to AWS IoT Core
}

void readAndPublishWeights() {
  // Read wet waste weight
  // Read dry waste weight
  // Read metal waste weight
  // Publish each reading with sequence number
}
```

### MQTT Topics
- Data: `sensors/weight-sensor-001/data`

### Message Format
```json
{
  "deviceId": "weight-sensor-001",
  "sensorType": "weight",
  "value": 0.0,
  "unit": "kg",
  "location": "bin-001",
  "wasteType": "wet|dry|metal",
  "measurementSequence": 1-3
}
```

---

## Common Configuration

### WiFi Credentials
```cpp
char ssid[] = "YOUR_WIFI_SSID";
char pass[] = "YOUR_WIFI_PASSWORD";
```

### AWS IoT Core
```cpp
const char* aws_endpoint = "a2pegkw5yeofz9-ats.iot.us-east-1.amazonaws.com";
const int aws_port = 8883;
```

### Security
- TLS 1.2 encryption
- X.509 certificate authentication
- Root CA, device certificate, private key embedded in code

### Libraries Required
- WiFi.h
- WiFiClientSecure.h
- PubSubClient.h
- ArduinoJson.h
- BlynkSimpleEsp32.h (waste sensor only)
- HX711.h (weight sensor only)

---

## Data Publishing Flow

```
Sensor Reading → JSON Serialization → MQTT Publish → AWS IoT Core
                                                           ↓
                                                    IoT Rule Trigger
                                                           ↓
                                                    Lambda Function
                                                           ↓
                                                       DynamoDB
```

---

## Alert Logic

### Waste Sensor Alerts
1. **Gas Alert**
   - Condition: MQ2 digital output HIGH
   - Action: Publish to `alerts/gas` + Blynk notification
   - Debounce: Only alert once until cleared

2. **Fire Alert**
   - Condition: Flame sensor LOW
   - Action: Publish to `alerts/fire` + Blynk notification
   - Debounce: Only alert once until cleared

### Weight Sensor Alerts
- Handled by Lambda function
- Threshold: > 2.8 kg per waste type

---

## Troubleshooting

### Common Issues

**Fire Sensor Always 1:**
- Check `pinMode(FLAME_PIN, INPUT_PULLUP)` vs `INPUT`
- Verify sensor wiring
- Test raw pin reading with Serial output

**Gas Sensor Not Triggering:**
- MQ2 needs 24-48 hour burn-in period
- Check digital threshold potentiometer
- Verify 5V power supply

**Weight Readings Negative:**
- Recalibrate HX711
- Check load cell wiring
- Verify calibration factor

**WiFi Connection Failed:**
- Verify SSID and password
- Check 2.4GHz network (ESP32 doesn't support 5GHz)
- Ensure signal strength

**AWS IoT Connection Failed:**
- Verify certificates are correct
- Check endpoint URL
- Ensure device policy allows publish/subscribe
- Verify system time (NTP sync)

---

## Code Files

### Main Sensor Code
- `/home/ubuntu/waste-management-system/iot/waste_sensor_blynk_aws.ino`
- `/home/ubuntu/waste-management-system/iot/weight_sensor_esp32_fixed.ino`

### Certificates
- `/home/ubuntu/waste-management-system/iot/waste-sensor-001.cert.pem`
- `/home/ubuntu/waste-management-system/iot/waste-sensor-001.private.key`
- `/home/ubuntu/waste-management-system/iot/weight-sensor-001.cert.pem`
- `/home/ubuntu/waste-management-system/iot/weight-sensor-001.private.key`

### Policies
- `/home/ubuntu/waste-management-system/iot/waste-sensor-policy.json`
- `/home/ubuntu/waste-management-system/iot/weight-sensor-policy.json`

---

## Performance Metrics

### Publishing Rate
- Both sensors: Every 5 seconds
- Weight sensor: 3 messages per cycle (one per waste type)
- Total: ~48 messages per minute

### Message Size
- Average: 150-200 bytes per message
- Format: JSON

### Power Consumption
- ESP32: ~160-260 mA active
- WiFi: Additional 120-200 mA
- Sensors: 10-50 mA each
- **Total: ~300-500 mA per device**

### Recommendations
- Use deep sleep between readings for battery operation
- Implement exponential backoff for reconnection
- Add watchdog timer for crash recovery
