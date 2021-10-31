/*
 * Primary file for the API
 */

// Dependencies
var http = require("http");
var https = require("https");
var url = require("url");
var stringDecoder = require("string_decoder").StringDecoder;
var config = require("./lib/config");
var fs = require("fs");
var handlers = require("./lib/handlers");
var helpers = require("./lib/helpers");

// Instantiate the HTTP server
var httpServer = http.createServer(function (req, res) {
    unifiedServer(req, res);
});

// Start the HTTP server
httpServer.listen(config.httpPort, function () {
    console.log(
        "The server is listening on port " +
            config.httpPort +
            " in " +
            config.envName +
            " mode"
    );
});

// Instantiate the HTTPS server
var httpsServerOptions = {
    key: fs.readFileSync("./https/key.pem"),
    cert: fs.readFileSync("./https/cert.pem"),
};
var httpsServer = https.createServer(httpsServerOptions, function (req, res) {
    unifiedServer(req, res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, function () {
    console.log(
        "The server is listening on port " +
            config.httpsPort +
            " in " +
            config.envName +
            " mode"
    );
});

// All the server logic for both the http and https server
var unifiedServer = function (req, res) {
    // Get the URL and parse it
    var parsedUrl = url.parse(req.url, true);

    // Get the path
    var path = parsedUrl.pathname; // gives untrimmed path like `/foo/`
    // trim slashes (/foo/ -> foo & /foo/bar -> foo/bar)
    var trimmedPath = path.replace(/\/+|\/+$/g, "");

    // Get the query string as an object
    var queryString = parsedUrl.query;

    // Get the HTTP method
    var method = req.method.toLowerCase();

    // Get the Headers as an object
    var headers = req.headers;

    // Get the payload, if any
    var decoder = new stringDecoder("utf-8");
    var buffer = ""; // buffer for a payload
    // get new data on the request on data object
    req.on("data", function (data) {
        // use decoder to convert that data into a simple string
        buffer += decoder.write(data);
    });
    // end the request by closing buffer and sending response
    req.on("end", function () {
        buffer += decoder.end();

        // Choose the handler this request should go to. If one not found, use the notFound handler.
        var chosenHandler =
            typeof router[trimmedPath] !== "undefined"
                ? router[trimmedPath]
                : handlers.notFound;

        // Construct data object to send to the handler
        var data = {
            trimmedPath: trimmedPath,
            queryString: queryString,
            method: method,
            headers: headers,
            payload: helpers.parseJsonToObject(buffer),
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, function (statusCode, payload) {
            // Use the status code called by the handler, or default to 200
            statusCode = typeof statusCode == "number" ? statusCode : 200;

            // Use the payload called by handler, or default to an empty object
            payload = typeof payload == "object" ? payload : {};

            // Convert the payload to a string
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader("Content-Type", "application/json");
            res.writeHead(statusCode);
            res.end(payloadString);

            // Log the request
            console.log("Returning this response: ", statusCode, payloadString);
        });
    });
};

// Define a request router
var router = {
    sample: handlers.sample,
    ping: handlers.ping,
    users: handlers.users,
    tokens: handlers.tokens,
};
