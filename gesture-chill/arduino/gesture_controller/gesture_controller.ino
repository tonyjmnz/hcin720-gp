//start magnetometer
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_LSM303_U.h>

/* Assign a unique ID to this sensor at the same time */
Adafruit_LSM303_Mag_Unified mag = Adafruit_LSM303_Mag_Unified(12345);
//end magnetometer

//nfc
#include <PN532_I2C.h>
#include <PN532.h>
#include <NfcAdapter.h>

PN532_I2C pn532_i2c(Wire);
NfcAdapter nfc = NfcAdapter(pn532_i2c);

//end nfc
void setup(void) 
{
  Serial.begin(9600);
  
  /* Enable auto-gain */
  mag.enableAutoRange(true);
  
  //initialize sensors
  mag.begin();
  nfc.begin();
  
  pinMode(8, OUTPUT);
  magnetOff();
}

String lastTag = "none";
bool nfcIsOn = true;
bool magnetometerIsOn = false;

//turns on the magnetometer
//and turns off the nfc reader
void magnetOn() {
  digitalWrite(8, LOW);
  nfcIsOn = false;
  magnetometerIsOn = true;
}

//turns off the magnetometer
//and turns on the nfc reader
void magnetOff() {
  digitalWrite(8, HIGH);
  nfcIsOn = true;
  magnetometerIsOn = false;
}

void loop(void) 
{
  //if we receive a message from the server, it means we have to turn the nfc on
  //and the magnetometer off
  if (Serial.available() > 0) {
    Serial.readString(); //clear the serial buffer
    magnetOff();
  }

  if (nfcIsOn && nfc.tagPresent(500))
  {
    //read the ndef record if a tag is present
    NfcTag tag = nfc.read();
    NdefRecord record = tag.getNdefMessage().getRecord(0);
    int payloadLength = record.getPayloadLength();
    byte payload[payloadLength];
    record.getPayload(payload);

    //nfc event identifier for the server
    String payloadStr = "{{nfc}}|";

    //the payload comes with the encoding in the first three
    //charactersof the string, remove them
    for (int pos = 3; pos < payloadLength; pos++)
    {
        payloadStr += (char)payload[pos];
    }

    //prevent reading the same tag over and over again
    if (lastTag != payloadStr) {
      //send the read tag id to the server via serial
      
      Serial.println(payloadStr);
      lastTag = payloadStr;
      magnetOn();
    }
  } else {
    lastTag = "none";
  }

  if (magnetometerIsOn) {
    // get a new sensor event
    sensors_event_t event; 
    mag.getEvent(&event);
    char magnetometerXYZ[40] = "";
    char tmp[10] = "";
    
    //magnetometer event identifier for the server
    strcat(magnetometerXYZ, "{{mag}}|");

    //copy x coordinate to our output array
    dtostrf(event.magnetic.x, 4, 2, tmp);
    strcat(magnetometerXYZ, tmp);
    strcat(magnetometerXYZ, ",");
    
    strcpy(tmp, "");

    //copy y coordinate to our output array
    dtostrf(event.magnetic.y, 4, 2, tmp);
    strcat(magnetometerXYZ, tmp);
    strcat(magnetometerXYZ, ",");
    
    strcpy(tmp, "");

    //copy z coordinate to our output array
    dtostrf(event.magnetic.z, 4, 2, tmp);
    strcat(magnetometerXYZ, tmp);
    strcpy(tmp, "");

    //send to server
    Serial.println(magnetometerXYZ);
    strcpy(magnetometerXYZ, "");
    
    //4hz sampling rate
    delay(250);
  }
}
