#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <HX711.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// AWS IoT Core settings
const char* aws_endpoint = "YOUR_AWS_IOT_ENDPOINT.iot.us-east-1.amazonaws.com";
const int aws_port = 8883;

// Device info
const char* device_id = "weight-sensor-001";
const char* location = "bin-001";

// MQTT topic
const char* data_topic = "sensors/weight-sensor-001/data";

// HX711 load cell pins
const int LOADCELL_DOUT_PIN = 19;
const int LOADCELL_SCK_PIN = 18;

// Certificate data - MOVED TO TOP
const char aws_root_ca[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
YOUR_AWS_ROOT_CA_HERE
-----END CERTIFICATE-----
)EOF";

const char aws_cert_crt[] PROGMEM = R"KEY(
-----BEGIN CERTIFICATE-----
YOUR_DEVICE_CERTIFICATE_HERE
-----END CERTIFICATE-----
)KEY";

const char aws_private_key[] PROGMEM = R"KEY(
-----BEGIN RSA PRIVATE KEY-----
YOUR_PRIVATE_KEY_HERE
-----END RSA PRIVATE KEY-----
)KEY";

// Load cell setup
HX711 scale;
float calibration_factor = -4300; // Adjust based on your load cell

// Weight measurement sequence
int measurement_count = 0;
float weights[3] = {0, 0, 0}; // wet, dry, metal
const char* waste_types[3] = {"wet", "dry", "metal"};

WiFiClientSecure net;
PubSubClient client(net);

void setup() {
  Serial.begin(115200);
  
  // Initialize load cell
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(calibration_factor);
  scale.tare(); // Reset scale to 0
  
  Serial.println("Load cell initialized. Place calibration weight and adjust calibration_factor if needed.");
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("WiFi connected!");
  
  // Configure AWS IoT
  net.setCACert(aws_root_ca);
  net.setCertificate(aws_cert_crt);
  net.setPrivateKey(aws_private_key);
  
  client.setServer(aws_endpoint, aws_port);
  
  connectAWS();
  
  Serial.println("Ready for weight measurements!");
  Serial.println("Measurement sequence: 1st = Wet waste, 2nd = Dry waste, 3rd = Metal waste");
}

void loop() {
  if (!client.connected()) {
    connectAWS();
  }
  client.loop();
  
  // Check if scale is ready
  if (scale.is_ready()) {
    float weight = scale.get_units(10); // Average of 10 readings
    
    if (abs(weight) > 0.01) { // Only process if weight > 10g
      Serial.printf("Weight detected: %.2f kg\n", weight);
      
      // Store weight in sequence
      weights[measurement_count] = weight;
      
      // Publish weight data
      publishWeightData(waste_types[measurement_count], weight);
      
      measurement_count++;
      
      // Reset after 3 measurements
      if (measurement_count >= 3) {
        Serial.println("Measurement cycle complete. Resetting...");
        measurement_count = 0;
        
        // Wait for scale to be cleared
        Serial.println("Please remove all items from scale...");
        delay(5000);
        scale.tare(); // Reset to zero
      }
      
      // Wait before next measurement
      delay(2000);
    }
  }
  
  delay(1000); // Check every second
}

void connectAWS() {
  while (!client.connected()) {
    Serial.print("Connecting to AWS IoT...");
    if (client.connect(device_id)) {
      Serial.println("Connected!");
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }
}

void publishWeightData(const char* wasteType, float weight) {
  StaticJsonDocument<200> doc;
  doc["deviceId"] = device_id;
  doc["sensorType"] = "weight";
  doc["wasteType"] = wasteType;
  doc["value"] = weight;
  doc["unit"] = "kg";
  doc["location"] = location;
  doc["measurementSequence"] = measurement_count + 1;
  
  char buffer[256];
  serializeJson(doc, buffer);
  
  client.publish(data_topic, buffer);
  Serial.printf("Published: %s\n", buffer);
  
  // Check for weight alerts
  if (weight > 2.8) {
    publishWeightAlert(wasteType, weight);
  }
}

void publishWeightAlert(const char* wasteType, float weight) {
  StaticJsonDocument<200> doc;
  doc["deviceId"] = device_id;
  doc["alertType"] = "WEIGHT_LIMIT";
  doc["wasteType"] = wasteType;
  doc["value"] = weight;
  doc["location"] = location;
  doc["timestamp"] = millis();
  
  char buffer[256];
  serializeJson(doc, buffer);
  
  client.publish("alerts/weight", buffer);
  Serial.printf("WEIGHT ALERT: %s\n", buffer);
}
