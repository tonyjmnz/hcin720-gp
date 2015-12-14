var config = require('./config');
var request = require('request');

var paused = false;
//paused = play
var getQueryString = function(showId) {
  return {
    'key': '/library/metadata/' + showId,
    'offset': 0,
    'X-Plex-Client-Identifier': '764e4cf8-11ea-4712-a758-5f0645e1c94a',
    'machineIdentifier': '6e66b5cec90c34a71ee5219dff309827eb2c61ea',
    'address': '129.21.100.79',
    'port': 32400,
    'protocol': 'http',
    'path': 'http://129.21.100.79:32400/library/metadata/4',
    'X-Plex-Token': 'NvPfhbWzivGmkagwbF28',
  };
};

var play = function(showId) {
  request({
    method: 'GET',
    baseUrl: config.plexURL,
    url: paused ? '/play' : '/playMedia',
    qs: getQueryString(showId)
  }, function (error, response, body) {
    //console.log(body);
    paused = false;
  });
};

var pause = function(showId) {
  request({
    method: 'GET',
    baseUrl: config.plexURL,
    url: '/pause',
    qs: getQueryString(showId)
  }, function (error, response, body) {
    //console.log(body);
    paused = !paused;
  });
};

var stop = function(showId) {
  request({
    method: 'GET',
    baseUrl: config.plexURL,
    url: '/stop',
    qs: getQueryString(showId)
  }, function (error, response, body) {
    //console.log(body);
    paused = false;
  });
};

module.exports =  {
  play: play,
  pause: pause,
  stop: stop,
};
