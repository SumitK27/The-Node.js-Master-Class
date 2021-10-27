/*
 * Primary file for the API
 */

// Dependencies
var http = require("http");
var https = require("https");
var url = require("url");
var stringDecoder = require("string_decoder").StringDecoder;
var config = require("./config");
var fs = require("fs");

// Instantiate the HTTP server
const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
});

// Start the HTTP server
httpServer.listen(config.httpPort, () => {
    console.log(
        "The server is listening on port " +
            config.httpPort +
            " in " +
            config.envName +
            " mode"
    );
});

// Instantiate the HTTPS server
const httpsServerOptions = {
    key: fs.readFileSync("./https/key.pem"),
    cert: fs.readFileSync("./https/cert.pem"),
};
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, () => {
    console.log(
        "The server is listening on port " +
            config.httpsPort +
            " in " +
            config.envName +
            " mode"
    );
});

// All the server logic for both the http and https server
const unifiedServer = (req, res) => {
    // Get the URL and parse it
    const parsedUrl = url.parse(req.url, true);

    // Get the path
    const path = parsedUrl.pathname; // gives untrimmed path like `/foo/`
    // trim slashes (/foo/ -> foo & /foo/bar -> foo/bar)
    const trimmedPath = path.replace(/\/+|\/+$/g, "");

    // Get the query string as an object
    const queryString = parsedUrl.query;

    // Get the HTTP method
    const method = req.method.toUpperCase();

    // Get the Headers as an object
    const headers = req.headers;

    // Get the payload, if any
    let decoder = new stringDecoder("utf-8");
    let buffer = ""; // buffer for a payload
    // get new data on the request on data object
    req.on("data", (data) => {
        // use decoder to convert that data into a simple string
        buffer += decoder.write(data);
    });
    // end the request by closing buffer and sending response
    req.on("end", () => {
        buffer += decoder.end();

        // Choose the handler this request should got to. If one not found, use the notFound handler.
        const chosenHandler =
            typeof router[trimmedPath] !== "undefined"
                ? router[trimmedPath]
                : handlers.notFound;

        // Construct data object to send to the handler
        const data = {
            trimmedPath,
            queryString,
            method,
            headers,
            payload: buffer,
        };

        // Route the requests to the handler specified in the router
        chosenHandler(data, (statusCode, payload) => {
            // Use the status code called by the handler, or default to 200
            statusCode = typeof statusCode == "number" ? statusCode : 200;

            // Use the payload called by handler, or default to an empty object
            payload = typeof payload == "object" ? payload : {};

            // Convert the payload to a string
            const payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader("Content-Type", "application/json");
            res.writeHead(statusCode);
            res.end(payloadString);

            // Log the request
            console.log(statusCode, ": ", payloadString);
        });
    });
};

// Define a handlers
const handlers = {};

// Sample handler
handlers.sample = (data, callback) => {
    // Callback a HTTP status code and a payload object
    callback(406, { name: "Sample Handler" });
};

// Not found handler
handlers.notFound = (data, callback) => {
    callback(404);
};

// Define a request router
const router = {
    sample: handlers.sample,
};
