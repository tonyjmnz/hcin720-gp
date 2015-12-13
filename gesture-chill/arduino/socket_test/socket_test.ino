#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_LSM303_U.h>

/* Assign a unique ID to this sensor at the same time */
Adafruit_LSM303_Mag_Unified mag = Adafruit_LSM303_Mag_Unified(12345);

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
  
  /* Initialise the sensor */
  if(!mag.begin())
  {
    /* There was a problem detecting the LSM303 ... check your connections */
    Serial.println("Ooops, no LSM303 detected ... Check your wiring!");
    while(1);
  }
  
  nfc.begin();
  pinMode(8, OUTPUT);
  magnetOff();
}

String lastTag;
bool nfcState = true;
bool magnetState = false;

void magnetOn() {
  digitalWrite(8, LOW);
  nfcState = false;
  magnetState = true;
}

void magnetOff() {
  digitalWrite(8, HIGH);
  nfcState = true;
  magnetState = false;
}

void loop(void) 
{
  //if we receive a message from the server, it means we have to turn the nfc on
  //and the magnetometer off
  if (Serial.available() > 0) {
    String buff = Serial.readString(); //clear the serial buffer
    magnetOff();
  }

  if (nfcState && nfc.tagPresent(500))
  {
    
    
    //read the ndef record if a tag is present
    NfcTag tag = nfc.read();
    NdefRecord record = tag.getNdefMessage().getRecord(0);
    int payloadLength = record.getPayloadLength();
    byte payload[payloadLength];
    record.getPayload(payload);

    String payloadStr = "";

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

  if (magnetState) {
    /* Get a new sensor event */ 
    sensors_event_t event; 
    mag.getEvent(&event);
    char magXYZ[40] = "";
    char tmp[10] = "";
    
    strcat(magXYZ, "{{mag}}|");
    dtostrf(event.magnetic.x, 4, 2, tmp);
    strcat(magXYZ, tmp);
    strcat(magXYZ, ",");
    strcpy(tmp, "");
    dtostrf(event.magnetic.y, 4, 2, tmp);
    strcat(magXYZ, tmp);
    strcpy(tmp, "");
    strcat(magXYZ, ",");
    dtostrf(event.magnetic.z, 4, 2, tmp);
    strcat(magXYZ, tmp);
    strcpy(tmp, "");
    
    Serial.println(magXYZ);
    strcpy(magXYZ, "");
    delay(250);
  }
}
