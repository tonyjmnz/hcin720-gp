/**
 * Includes
 */
#include <Adafruit_CC3000.h>
#include <SocketIOClient.h>
#include <SPI.h>
#include "utility/debug.h"

/**
 * Network config
 */
#define WLAN_SSID "rwk"
#define WLAN_PASS "rochesteresunamierda"
#define WLAN_SECURITY WLAN_SEC_WPA2

/**
 * Pins
 */
#define ADAFRUIT_CC3000_IRQ   3
#define ADAFRUIT_CC3000_VBAT  5
#define ADAFRUIT_CC3000_CS    10

Adafruit_CC3000 cc3000 = Adafruit_CC3000(ADAFRUIT_CC3000_CS, ADAFRUIT_CC3000_IRQ, ADAFRUIT_CC3000_VBAT, SPI_CLOCK_DIV2); // you can change this clock speed

SocketIOClient client;

void ondata(SocketIOClient client, char *data) {
  Serial.println(F("Incoming data!"));
  Serial.println(data);
  Serial.println(F("----------"));
}

void setup() {
  Serial.begin(9600);
  InitializeCC30000();

  Serial.print("Free RAM: "); Serial.println(getFreeRam(), DEC);
  client.setDataArrivedDelegate(ondata);
  if (!client.connect(cc3000, "sandbox.carlosetejada.com", 80)) {
    Serial.println(F("Not connected."));
  }
}

void loop() {
  client.monitor(cc3000);
  client.sendEvent("info", "foobar");
  delay(2000);
}

void InitializeCC30000(void){
  // initialise the module
  Serial.println(F("Initializing..."));

  // initialize CC3000 chip
  if (!cc3000.begin()) {
    Serial.println(F("Couldn't begin()! Check your wiring?"));
    while(1);
  }

  // optional SSID scan
  if (!cc3000.connectToAP(WLAN_SSID, WLAN_PASS, WLAN_SECURITY)) {
    Serial.println(F("Failed!"));
    while(1);
  }

  Serial.println(F("Connected!"));

  // wait for DHCP to complete
  Serial.println(F("Request DHCP"));
  while (!cc3000.checkDHCP()) {
    delay(100);
  }  
}
