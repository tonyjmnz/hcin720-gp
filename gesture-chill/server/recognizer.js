var OneDollar = require('one-dollar');

var recognizer = OneDollar();

var gestureData = require('./data');
var playGestures = gestureData.play;
var stopGestures = gestureData.stop;
var pauseGestures = gestureData.pause;

var knownGestures = ['play', 'pause', 'stop'];

var pointify = function(gesture) {
    var gestPoints = gesture.map(function(point) {
        return {X:point[0], Y:point[1]};
    });

    return gestPoints;
};

//add all the play gestures to our model
playGestures.map(function(gest){
  recognizer.addGesture('play', pointify(gest));
});

//add all the stop gestures to our model
stopGestures.map(function(gest){
  recognizer.addGesture('stop', pointify(gest));
});

//add all the pause gestures to our model
pauseGestures.map(function(gest){
  recognizer.addGesture('pause', pointify(gest));
});


module.exports = {
  recognize: function(data) {
    //console.log(data);
    var gesture = recognizer(data);
    if (knownGestures.indexOf(gesture.name) < 0) {
      return 'nomatch';
    }
    return gesture.name;
  }
};
