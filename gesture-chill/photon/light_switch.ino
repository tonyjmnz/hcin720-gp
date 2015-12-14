int tailPin = D7;
int currentLightMode = LOW;

void setup() {
  pinMode(tailPin, OUTPUT);
  Spark.function("setLightMode", setLightMode);
}

void loop() {

}

void writeLightMode(int lightMode) {
    Spark.publish("Wrote lightMode: " + String(lightMode));
    digitalWrite(tailPin, lightMode);
}

int setLightMode(String lightMode) {
    currentLightMode = lightMode == "on" ? HIGH : LOW;
    writeLightMode(currentLightMode);
    return 1;
}
