// Primary File for API
//Config File first
const config = require('./config');

//HTTP Module
const http = require('http');
//HTTPS Module
const https = require('https');
//Module to parse urls
const url = require('url');
//String decoder for payload
const StringDecoder = require('string_decoder').StringDecoder;
//file system
const fs = require('fs');

//Create Server
const httpServer = http.createServer(function(req, res){
   unifiedServer(req, res);
});

//Instantiate HTTPS server
let httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
}
const httpsServer = https.createServer(httpsServerOptions, function(req, res) {
    unifiedServer(req, res);
})

//Start server to listen on port
httpServer.listen(config.httpPort, function(){
    console.log(`The server is listening on port ${config.httpPort} in the ${config.envName} mode`);
});

httpsServer.listen(config.httpPort, function(){
    console.log(`The server is listening on port ${config.httpsPort} in the ${config.envName} mode`);
});

//Server Function
let unifiedServer = function(req, res) {
    //Get the URL and parse it
    let parsedUrl = url.parse(req.url, true); //req.url is now enough for this
    //Path from URL
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, ''); //Removes excess '/'


    //Get Query String as an object
    let queryString = parsedUrl.query;

    //Get HTTP Method
    let method = req.method.toLowerCase();

    //Get Headers
    let headers = req.headers;

    //Get Payload or Body
    let decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data);
    }) //Data added to buffer as it streams in. Data event on req
    req.on('end', function(){
        // for when the stream has ended
        buffer += decoder.end();
        //can console out body here or buffer

        //choose request handler to use
        let chosenHandler = typeof(router[trimmedPath]) != 'undefined' ? router[trimmedPath] : handlers.notFound;

        // construct a data object to send to handler
        let data = {
            'trimmedPath': trimmedPath,
            'queryString': queryString,
            'method': method,
            'headers': headers,
            'payload': buffer
        }

        //route request to handler
        chosenHandler(data, function(statusCode, payload) {
            //Use the status code or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            //Use payload or default to empty 
            payload = typeof(payload) == 'object' ? payload : {};
            //Convert payload object to string
            let payloadString = JSON.stringify(payload)

            //return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            //Log path
            console.log('Backend returned this: ' + payloadString + statusCode);
        });
    })
}

//Define handlers
let handlers = {}
//Sample Handler
handlers.sample = function(data, callback) {
    //status code and payload object
    callback(406, {'name': 'sample handler'});

}
//Not found or default handler
handlers.notFound = function(data, callback) {
    callback(404);
}

// Define a request router
let router = {
    'sample' : handlers.sample,
}