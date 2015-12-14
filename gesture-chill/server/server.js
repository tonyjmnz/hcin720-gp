"use_strict";
var exec       = require('child_process').exec;

var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var serial;

var magnetometer = require('./magnetometer');
var photon = require('./photon');
var plex = require('./plex');

//When the serial port is successfully opened...
var onSerialOpen = function()
{
  var detectingGesture = false;
  var quietCount = 0;
  var gesturePoints = [];
  var showId = '';

  //converts [1,2,3] into {x:1, y:2, z:3}
  var toPoint = function(pointsArray) {
    return {
      x: pointsArray[0],
      y: pointsArray[1],
      z: pointsArray[2],
    };
  }

  //When we get data from the serial port...
  serial.on('data', function(message)
  {
    //the message comes with a trailing space from the arduino...
    message = message.trim();
    //console.log("From Arduino: ", message);
    var splitMsg = message.split('|');
    var msgType = splitMsg[0];
    var data = splitMsg[1];

    //we received a message requesting a current tracked show status
    if (msgType === '{{mag}}') {
      //console.log('Got magnetometer data:', data);
      var point = toPoint(data.split(','));

      var gesture = magnetometer.analyzePoint(point);
      console.log(gesture);
      if (gesture === 'stop') {
        plex.stop(showId);
        serial.write('nfc_on');
        photon.turnOn();
        showId = '';
      }

      if(gesture === 'play') {
        plex.play(showId);
        photon.turnOff();
      }

      if(gesture === 'pause') {
        plex.pause(showId);
        photon.turnOn();
      }

    } else if( msgType === '{{nfc}}') {
      console.log('Got nfc data:', data);
      showId = data;
    }
  });
};

exec('ls /dev/tty.usbmodem*', function(error, stdout, stderr) {
  var devName = stdout.split('\n')[0];
  //Hook up the serial port
  serial = new SerialPort( devName, {parser: serialport.parsers.readline('\n')});
  //When the serial port is successfully opened...
  serial.on('open', onSerialOpen);
});
