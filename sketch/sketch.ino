const int soilPin = A0;   // Analog pin for soil moisture sensor
const int relayPin = A3;  // Pin connected to the relay for controlling the pump

void setup() {
  Serial.begin(9600);
  pinMode(relayPin, OUTPUT);  // Set relayPin as an output to control the relay
}

void loop() {
  if (Serial.available() > 0) {
    char commandNumber = Serial.read();
    executeCommand(commandNumber);
  }
}

void executeCommand(char command) {
  switch (command) {
    case '1':
      fetchSoilMoisture();
      break;
    case '2':
      startPump();  // Command to start the pump
      break;
    case '3':
      stopPump();  // Command to stop the pump
      break;
    default:
      // Invalid command
      break;
  }
  Serial.flush();
}

void fetchSoilMoisture() {
  int soilMoisture = analogRead(soilPin);
  Serial.println(soilMoisture);
}

void startPump() {
  digitalWrite(relayPin, LOW);  // Activate the relay (start the pump)
}

void stopPump() {
  digitalWrite(relayPin, HIGH);  // Deactivate the relay (stop the pump)
}