"use_strict";

var http       = require('http');
var fs = require('fs');
var exec       = require('child_process').exec;

var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var serial;

var OneDollar = require('one-dollar');
var gestureData = require('./data');


var recognizer = (function() {
 var recognize = OneDollar();
 var knownGestures = ['play', 'pause', 'stop'];

  var playGestures = gestureData.play;
  var stopGestures = gestureData.stop;
  var pauseGestures = gestureData.pause;

  var pointify = function(gesture) {
      var gestPoints = gesture.map(function(point) {
          return {X:point[0], Y:point[1]};
      });

      return gestPoints;
  };

  //add all the play gestures to our model
  playGestures.map(function(gest){
    recognize.addGesture('play', pointify(gest));
  });

  //add all the stop gestures to our model
  stopGestures.map(function(gest){
    recognize.addGesture('stop', pointify(gest));
  });

  //add all the pause gestures to our model
  pauseGestures.map(function(gest){
    recognize.addGesture('pause', pointify(gest));
  });


  return {
    recognize: function(data) {

      var gesture = recognize(data);
      if (knownGestures.indexOf(gesture.name) < 0) {
        return 'nomatch';
      }
      return gesture.name;
    }
  };
}());

var magnetometer = (function() {
  var detectingGesture = false;
  var quietCount = 0;
  var gesturePoints = [];

  var analyzeGesture = function(gesturePoints) {
    //delete the last 8 gesture records because they're 'quiet' points
    gesturePoints = gesturePoints.splice(0, gesturePoints.length - 8)
    return recognizer.recognize(gesturePoints);
  };

  var analyzePoint = function(point) {

    if (Math.abs(point.z) >= 100) {
      detectingGesture = true;
      quietCount = 0;
      //console.log('console log nfc_on');
      //serial.write('nfc_on');
    } else {
      quietCount++;
    }

    //save in a format known by $1
    if (detectingGesture) {
      gesturePoints.push([parseFloat(point.x, 2), parseFloat(point.y, 2)]);
    }


    if (detectingGesture && quietCount >= 8) {
      detectingGesture = false;
      var gesture = analyzeGesture(gesturePoints);
      gesturePoints = [];
      return gesture;
    } else {
      return 'nomatch';
    }

  };

  return {
    analyzePoint: analyzePoint
  };

}());


//When the serial port is successfully opened...
var onSerialOpen = function()
{
  var detectingGesture = false;
  var quietCount = 0;
  var gesturePoints = [];

  var toPoint = function(pointsArray) {
    return {
      x: pointsArray[0],
      y: pointsArray[0],
      z: pointsArray[0],
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
        //stop movie
        serial.write('nfc_on');
        //turn on lights
      }

      if(gesture === 'play') {
        //play movie
        //turn off ligts
      }

      if(gesture === 'pause') {
        //pause movie
        //turn on ligts
      }

    } else if( msgType === '{{nfc}}') {
      console.log('Got nfc data:', data);
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
