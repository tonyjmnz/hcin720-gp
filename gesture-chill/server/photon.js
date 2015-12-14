var config = require('./config');
var request = require('request');

var makeRequest = function(command) {
  request.post({
    url: config.sparkURL,
    form: {
      access_token: config.sparkAccessToken,
      args: command
    }
  }, function (e, r, body) {
    //console.log(body);
  });
};

var turnOn = function() {
  makeRequest('on');
};

var turnOff = function() {
  makeRequest('off');
};

module.exports = {
  turnOn: turnOn,
  turnOff: turnOff,
};
