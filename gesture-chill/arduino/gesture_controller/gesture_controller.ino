/*************************************************** 
  This is an example for the Adafruit CC3000 Wifi Breakout & Shield

  Designed specifically to work with the Adafruit WiFi products:
  ----> https://www.adafruit.com/products/1469

  Adafruit invests time and resources providing this open source code, 
  please support Adafruit and open-source hardware by purchasing 
  products from Adafruit!

  Written by Limor Fried & Kevin Townsend for Adafruit Industries.  
  BSD license, all text above must be included in any redistribution
 ****************************************************/
 
 /*
This example does a test of the TCP client capability:
  * Initialization
  * Optional: SSID scan
  * AP connection
  * DHCP printout
  * DNS lookup
  * Optional: Ping
  * Connect to website and print out webpage contents
  * Disconnect
SmartConfig is still beta and kind of works but is not fully vetted!
It might not work on all networks!
*/
#include <Adafruit_CC3000.h>
#include <ccspi.h>
#include <SPI.h>
#include <string.h>
#include "utility/debug.h"

// These are the interrupt and control pins
#define ADAFRUIT_CC3000_IRQ   3  // MUST be an interrupt pin!
// These can be any two pins
#define ADAFRUIT_CC3000_VBAT  5
#define ADAFRUIT_CC3000_CS    10
// Use hardware SPI for the remaining pins
// On an UNO, SCK = 13, MISO = 12, and MOSI = 11
Adafruit_CC3000 cc3000 = Adafruit_CC3000(ADAFRUIT_CC3000_CS, ADAFRUIT_CC3000_IRQ, ADAFRUIT_CC3000_VBAT,
                                         SPI_CLOCK_DIVIDER); // you can change this clock speed

#define WLAN_SSID       "OnePlus2"           // cannot be longer than 32 characters!
#define WLAN_PASS       "tonytony"
// Security can be WLAN_SEC_UNSEC, WLAN_SEC_WEP, WLAN_SEC_WPA or WLAN_SEC_WPA2
#define WLAN_SECURITY   WLAN_SEC_WPA2

#define IDLE_TIMEOUT_MS  3000      // Amount of time to wait (in milliseconds) with no data 
                                   // received before closing the connection.  If you know the server
                                   // you're accessing is quick to respond, you can reduce this value.

// What page to grab!
#define WEBSITE      "sandbox.carlosetejada.com"
#define WEBPAGE      "/"





//magenetometer
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_LSM303_U.h>

/* Assign a unique ID to this sensor at the same time */
Adafruit_LSM303_Mag_Unified mag = Adafruit_LSM303_Mag_Unified(12345);
//end magnetometer

/**************************************************************************/
/*!
    @brief  Sets up the HW and the CC3000 module (called automatically
            on startup)
*/
/**************************************************************************/

uint32_t ip;

void setup(void)
{
  Serial.begin(115200);
  Serial.println(F("Hello, CC3000!\n")); 

  Serial.print("Free RAM: "); Serial.println(getFreeRam(), DEC);
  
  /* Initialise the module */
  Serial.println(F("\nInitializing..."));
  if (!cc3000.begin())
  {
    Serial.println(F("Couldn't begin()! Check your wiring?"));
    while(1);
  }
  
  // Optional SSID scan
  // listSSIDResults();
  
  Serial.print(F("\nAttempting to connect to ")); Serial.println(WLAN_SSID);
  if (!cc3000.connectToAP(WLAN_SSID, WLAN_PASS, WLAN_SECURITY)) {
    Serial.println(F("Failed!"));
    while(1);
  }
   
  Serial.println(F("Connected!"));
  
  /* Wait for DHCP to complete */
  Serial.println(F("Request DHCP"));
  while (!cc3000.checkDHCP())
  {
    delay(100); // ToDo: Insert a DHCP timeout!
  }  
  
  ip = 0;
  // Try looking up the website's IP address
  Serial.print(WEBSITE); Serial.print(F(" -> "));
  while (ip == 0) {
    if (! cc3000.getHostByName(WEBSITE, &ip)) {
      Serial.println(F("Couldn't resolve!"));
    }
    delay(500);
  }

  cc3000.printIPdotsRev(ip);
  
  // Optional: Do a ping test on the website
  /*
  Serial.print(F("\n\rPinging ")); cc3000.printIPdotsRev(ip); Serial.print("...");  
  replies = cc3000.ping(ip, 5);
  Serial.print(replies); Serial.println(F(" replies"));
  */  

  /* Try connecting to the website.
     Note: HTTP/1.1 protocol is used to keep the server from closing the connection before all data is read.
  */

//magnetometer
  /* Initialise the sensor */
  if(!mag.begin())
  {
    /* There was a problem detecting the LSM303 ... check your connections */
    Serial.println("Ooops, no LSM303 detected ... Check your wiring!");
    while(1);
  }
//end magnetometer
  
}

char magnetometerBuffer[400] = "";
bool reading = false;
int quietCount = 0;
String showId = "flash";

void loop(void)
{
 /* Get a new sensor event */ 
  sensors_event_t event; 
  mag.getEvent(&event);

  if (abs(event.magnetic.x) > 25 && abs(event.magnetic.y) > 25 ) {
    Serial.println("detecting a magnet!");
    reading = true;
    quietCount = 0;
  } else {
    quietCount++;
  }

  if(reading) {
    char x[20] = "";
    char y[20] = "";
    
    dtostrf(event.magnetic.x, 4, 2, x);
    dtostrf(event.magnetic.y, 4, 2, y);
    
    strcat(magnetometerBuffer, x);
    strcat(magnetometerBuffer, ",");
    strcat(magnetometerBuffer, y);
    strcat(magnetometerBuffer, ";");
    //magnetBuffer += String(x) + "," + String(y) + ";";
    
  } 
  
  //if(reading && quietCount >= 8 && strlen(magnetBuffer) != 0) {
  if(reading && quietCount >= 8) {
    Serial.println(magnetometerBuffer);
    sendData();
    strcpy(magnetometerBuffer, "");
    quietCount = 0;
    reading = false;
  }
  
  /* Display the results (magnetic vector values are in micro-Tesla (uT)) */
  //Serial.print("X: "); Serial.print(event.magnetic.x); Serial.print("  ");
  //Serial.print("Y: "); Serial.print(event.magnetic.y); Serial.print("  ");
  //Serial.print("Z: "); Serial.print(event.magnetic.z); Serial.print("  ");Serial.println("uT");
  delay(500);
}

//String buildRequestBody() {
  //Serial.print("alive!");
  //return String(String("{\"showId\":\"") + showId + String("\",\"magnetometer\":\"") + String(magnetometerBuffer) + String("\"}"));
  //return "{\"showId\":\"";
//}

void sendData() {
 
 Adafruit_CC3000_Client client = cc3000.connectTCP(ip, 80);
  if (client.connected()) {
    int contentLength = strlen(magnetometerBuffer);
    char strContentLength[4] = "";
    itoa(contentLength, strContentLength, 10);

    client.fastrprint(F("GET "));
    client.fastrprint(WEBPAGE);
    client.fastrprint(F(" HTTP/1.1\r\n"));
    Serial.println(WEBSITE);
    client.fastrprint(F("Host: ")); client.fastrprint(WEBSITE); client.fastrprint(F("\r\n"));
    client.print("Content-Length: "); client.print(strContentLength); client.println();
    Serial.println("after1");
    //client.fastrprint(F("\r\n"));
    client.println();
    //Serial.println("after2");

    char chunk[16]; //an extra char because strncpy null-terminates
    for (int i = 0; i < contentLength; i=i+15) {



      strncpy(chunk, magnetometerBuffer + i, 15);
            Serial.print(chunk);
      client.fastrprint(chunk);
      strcpy(chunk, "");
    }
    
  } else {
    Serial.println(F("Connection failed"));    
    return;
  }

  Serial.println(F("-------------------------------------"));
  
  /* Read data until either the connection is closed, or the idle timeout is reached. */ 
  unsigned long lastRead = millis();
  while (client.connected() && (millis() - lastRead < IDLE_TIMEOUT_MS)) {
    while (client.available()) {
      char c = client.read();
      Serial.print(c);
      lastRead = millis();
    }
  }
  client.close();
  Serial.println(F("-------------------------------------"));
  
  /* You need to make sure to clean up after yourself or the CC3000 can freak out */
  /* the next time your try to connect ... */
  //Serial.println(F("\n\nDisconnecting"));
  //cc3000.disconnect();
  
}

