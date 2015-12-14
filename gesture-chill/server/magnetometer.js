var detectingGesture = false;
var quietCount = 0;
var gesturePoints = [];
var recognizer = require('./recognizer');

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

  if (detectingGesture && quietCount >= 20) {
    detectingGesture = false;
    var gesture = analyzeGesture(gesturePoints);
    gesturePoints = [];
    return gesture;
  } else {
    return 'nomatch';
  }

};

module.exports = {
  analyzePoint: analyzePoint
};

