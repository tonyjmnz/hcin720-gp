
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

dispatcher.onGet("/", function(req, res) {
    var body = '';
    req.on('data', function(chunk) {
      //console.log("Received body data:");
      //console.log(chunk.toString());
      //console.log(chunk.toString());
      body += chunk.toString();
    });
    req.on('end',function(){
      console.log(body);
    });
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Page One');
});

