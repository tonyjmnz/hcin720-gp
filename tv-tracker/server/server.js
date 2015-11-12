var http       = require('http');
var fs = require('fs');
var serialport = require('serialport');
var exec       = require('child_process').exec;
var SerialPort = serialport.SerialPort;
var serial;

//When the serial port is successfully opened...
var onSerialOpen = function()
{
    //initialize our servos with data from our db or with the default structure
    var servos = db.load() ||
        [{name: "topServo", showId: undefined, currentPercentage: 0.00},
        {name: "bottomServo", showId: undefined, currentPercentage: 0.00}];

    console.log("opened serial port");
    //When we get data from the serial port...
    serial.on('data', function(message)
    {
        //the message comes with a trailing space from the arduino...
        message = message.trim();
        console.log("From Arduino: ", message);

        //we received a message requesting a current tracked show status
        if (message.indexOf('{{update}}') === 0) {
            var updateMsg = message.split(',');
            var servoName = updateMsg[1];

            var servoToUpdate = servos.filter(function(servo) {
                return servo.name === servoName;
            })[0];

            var updatedPercentage = traktInterface.getProgressBar(servoToUpdate.showId);
            if (updatedPercentage === servoToUpdate.currentPercentage) {
                return;
            }

            var dir = updatedPercentage > servoToUpdate.currentPercentage ? '0' : '180';

            //the bottom servo has its direction inverted because of its placement in the box
            if (servoName === 'bottomServo') {
                dir = dir === '180' ? '0' : '180';
            }

            //send the updated configuration to the arduino
            serial.write(servoName + ',' + servoToUpdate.showId + ',' + dir + ',' +
                Math.abs(servoToUpdate.currentPercentage - updatedPercentage));

            servoToUpdate.currentPercentage = updatedPercentage;
            return;
        } else {
            var showId = message;
        }

        //check if we need to clear a current tracked show
        var servoToClear = servos.filter(function(servo) {
            return servo.showId === showId;
        })[0];

        if (servoToClear) {

            var dir = servoToClear.name === 'topServo' ? '180' : '0';
            console.log("Sent: " + servoToClear.name + ',' + servoToClear.showId + ',' + dir +
                ',' + servoToClear.currentPercentage);

            //reset the servo position in the arduino
            serial.write(servoToClear.name + ','
                + servoToClear.showId + ',' + dir + ','
                + servoToClear.currentPercentage);

            servoToClear.currentPercentage = 0.00;
            servoToClear.showId = undefined;
            db.update(servos);
            return;
        }

        //if there was no servo to clear it means we have to set one to track
        //the provided show id

        //get an available servo (undefined showId)
        var availableServo = servos.filter(function(servo){
            return !servo.showId;
        })[0];


        //this only happens if an user tries to set a third show while 2 are
        //already being tracked
        if (!availableServo) {
            console.log('All the servos are being used!');
            return;
        }

        var progress = traktInterface.getProgressBar(showId);
        //if the getProgressBar returns false that means the show key wasn't found
        if (progress === false) {
            return;
        }

        //set up the servo
        availableServo.showId = showId;
        availableServo.currentPercentage = progress;

        var dir = availableServo.name === 'topServo' ? '0' : '180';

        console.log("Sent: " + availableServo.name + ',' +
            availableServo.showId + ',' + dir + ',' +
            availableServo.currentPercentage);

        //send the right configuration to the arduino
        serial.write(availableServo.name + ',' +
            availableServo.showId + ',' + dir + ',' +
            availableServo.currentPercentage);

        db.update(servos);
    });

};

var db = (function() {
    var dbPath = './db.json';

    var update = function(servos) {
        writeData(dbPath, JSON.stringify(servos));
    };

    var load = function() {
        var data = readData(dbPath);
        return data ? JSON.parse(data) : false;
    };

    var writeData = function(filePath, text) {
        fs.writeFile (filePath, text, function(err) {
            if (err) throw err;
        });
    };

    var readData = function(filePath) {
        try {
            fs.statSync(dbPath);
            return fs.readFileSync(dbPath, 'utf8');
        } catch (e) {
            //db file not found, we'll create it when a tag is read.
            return;
        }
    };

    return {
        load: load,
        update: update
    }
})();

var traktInterface = (function() {
    var traktKey = '1945c35153e6125c10a59941f5b381c8015baaacff136ba9fc27e7b009ff9def';
    var progress = {};
    var host = 'api-v2launch.trakt.tv';

    //update show progress every 3 seconds
    setInterval(function(){
        makeRequest('/users/ctejada10/watched/shows', updateShowProgress);
    }, 3000);

    //build the request for the trakt API
    var makeRequest = function(path, callback) {
        var options = {
          host: host,
          path: path,
          headers: {
            'Content-Type': 'application/json',
            'trakt-api-version': '2',
            'trakt-api-key': traktKey
          },
          port: 80,
          method: 'GET'
        };

        var req = http.request(options, function(res) {
          res.setEncoding('utf8');
          var data = '';
          res.on('data', function (chunk) {
            data += chunk;
          });
          res.on('end', function() {
            callback(data);
          });
        });

        req.on('error', function(e) {
          console.log('problem with request: ' + e.message);
          console.log(e);
        });
        req.end();
    };

    //updates the progress object with the progress of all of the user's folowed TV shows
    var updateShowProgress = function (data) {
        var viewedEpisodes = {}
        var showId;

        //calculate the watched percentage for each show
        var getPercentage = function (data) {
            var response = JSON.parse(data);
            var airedEpisodes = response['aired_episodes'];
            var showName = response['title'];

            progress[showName] = viewedEpisodes[showName] / airedEpisodes;
        };

        //count the watched episodes of each show and store it in viewedEpisodes
        var response = JSON.parse(data);
        for (i = 0; i < response.length; i++) {
            var showName = response[i]['show']['title'];
            for (j = 0; j < response[i]['seasons'].length; j++) {
                for (k = 0; k < response[i]['seasons'][j]['episodes'].length; k++) {
                    //if the show is already in the viewedEpisodes object increment the view count,
                    //else add it to the viewedEpisodes object;
                    if ((Object.keys(viewedEpisodes).indexOf(showName)) === -1) {
                        viewedEpisodes[showName] = 1;
                    } else {
                        viewedEpisodes[showName] += 1;
                    }
                }
            }

            //get all the episodes of a show
            showId = response[i]['show']['ids']['slug']
            makeRequest('/shows/' + showId + '?extended=full', getPercentage);
        }

    };

    return {
        //returns the current watched percentage of a show (float from 0 to 1)
        getProgressBar: function(showId) {

            if (progress[showId] === undefined) {
                return false;
            }

            return progress[showId].toFixed(2);
        }
    };
})();

exec('ls /dev/tty.usbmodem*', function(error, stdout, stderr) {
  var devName = stdout.split('\n')[0];
  //Hook up the serial port
  serial = new SerialPort( devName, {parser: serialport.parsers.readline('\n')});
  //When the serial port is successfully opened...
  serial.on('open', onSerialOpen);
});
