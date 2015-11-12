#include <Wire.h>
#include <PN532_I2C.h>
#include <PN532.h>
#include <NfcAdapter.h>
#include <Servo.h>

PN532_I2C pn532_i2c(Wire);
NfcAdapter nfc = NfcAdapter(pn532_i2c);

// for continuous rotation servos, 0 means full speed in one direction,
// 180 means full speed in the other direction and somewhere between 90
// means no motion.
Servo topServo;
int topServoZero = 89;

Servo bottomServo;
int bottomServoZero = 86;

void setup(void) {
    Serial.begin(9600);
    Serial.println("NDEF Reader");

    topServo.attach(9);
    bottomServo.attach(10);

    topServo.write(topServoZero);
    bottomServo.write(bottomServoZero);
    nfc.begin();
}

//set up the servos according to the server message
void setServo(String servoName, String showId, int dir, float percentage/*, String percentageString*/) {

    Servo currentServo = servoName == "topServo" ? topServo : bottomServo;
    int currentServoZero = servoName == "topServo" ? topServoZero : bottomServoZero;

    currentServo.write(dir);
    delay(percentage * 2700);
    currentServo.write(currentServoZero);
}

String lastTag;
long positionUpdateMillis = 0;

void loop(void) {

    //if we receive a message from the server, decode it and
    //change servo positions
    if (Serial.available() > 0) {
      String servoName  = Serial.readStringUntil(',');

      String showId = Serial.readStringUntil(',');

      String dirString = Serial.readStringUntil(',');
      int dir = atoi(dirString.c_str());

      String percentageString  = Serial.readStringUntil('\0');
      float percentage = atof(percentageString.c_str());

      setServo(servoName, showId, dir, percentage);//, percentageString);
    }

    if (nfc.tagPresent(500))
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
        }
    } else {
      lastTag = "none";
    }

    //check if the server has new position values for our tracked shows
    if (millis() - positionUpdateMillis >= 5000) {
      Serial.println("{{update}},topServo");// + topServoPosition);
      Serial.println("{{update}},bottomServo");// + bottomServoPosition);
      positionUpdateMillis = millis();
    }

    delay(500);
}
