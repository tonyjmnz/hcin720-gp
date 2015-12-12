root@sandbox:~/app# nodejs app.js
Server listening on: http://localhost:80
/
53.73,46.18;27.73,0.00;10.45,2.64;5.18,0.27;-372.36,-44.91;-372.36,-372.36;-73.09,13.91;-21.64,11.91;-22.09,11.91;-22.00,11.91;-22.18,11.82;-21.55,11.91;-22.00,11.91;-21.91,11.82;|flash
/
-372.36,25.82;-372.36,-372.36;-129.82,-372.36;-80.55,4.18;-43.55,-39.09;-64.82,-372.36;-21.09,13.18;-22.64,10.55;-19.55,13.18;-20.64,12.27;-20.64,12.27;-20.64,12.36;-20.55,12.55;-20.82,12.09;|flash
^Croot@sandbox:~/app# vim app.js
















//Lets require/import the HTTP module
var http = require('http');
var dispatcher = require('httpdispatcher');

//Lets define a port we want to listen to
const PORT=80;

//We need a function which handles requests and send response
function handleRequest(request, response){
    try {
        //log the request on console
        console.log(request.url);
        //Disptach
        dispatcher.dispatch(request, response);
    } catch(err) {
        console.log(err);
    }
}
//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});
"app.js" 42L, 1154C                                                   1,1           Top

var http = require('http');
var dispatcher = require('httpdispatcher');

//Lets define a port we want to listen to
const PORT=8080;

//We need a function which handles requests and send response
function handleRequest(request, response){
    try {
        //log the request on console
        console.log(request.url);
        //Disptach
        dispatcher.dispatch(request, response);
    } catch(err) {
        console.log(err);
    }
}
//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});

dispatcher.onGet("/", function(req, res) {
    console.log(req.headers);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Page One');
});
