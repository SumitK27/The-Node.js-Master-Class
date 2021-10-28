# **Table of Content** <!-- omit in toc -->

1. [**Background Information**](#background-information)
   1. [**History of Node**](#history-of-node)
      1. [**2009**](#2009)
      2. [**2010**](#2010)
      3. [**2011**](#2011)
      4. [**2012**](#2012)
      5. [**2015**](#2015)
   2. [**V8**](#v8)
   3. [**What is NodeJS?**](#what-is-nodejs)
   4. [**Anatomy of NodeJS Application**](#anatomy-of-nodejs-application)
   5. [**Common Node Conventions**](#common-node-conventions)
      1. [`package.json`](#packagejson)
      2. [`package-lock.json`](#package-lockjson)
      3. [`Importing packages`](#importing-packages)
      4. [`Testing`](#testing)
      5. [`Documentation & Source Control`](#documentation--source-control)
      6. [`Environments & Configuration`](#environments--configuration)
      7. [`Styles and Patterns`](#styles-and-patterns)
      8. [`Error Handling`](#error-handling)
   6. [**NodeJS vs Browser/Window**](#nodejs-vs-browserwindow)
      1. [`Possible only in Browser`](#possible-only-in-browser)
      2. [`Possible with Node`](#possible-with-node)
2. [**RESTful API**](#restful-api)
   1. [**Creating a Server**](#creating-a-server)
   2. [**Parsing Request Paths**](#parsing-request-paths)
   3. [**Parsing HTTP Methods**](#parsing-http-methods)
   4. [**Parsing Query Strings**](#parsing-query-strings)
   5. [**Parsing Request Headers**](#parsing-request-headers)
   6. [**Parsing Payloads**](#parsing-payloads)
   7. [**Routing Requests**](#routing-requests)
   8. [**Adding Configuration**](#adding-configuration)
   9. [**Adding HTTPS Support**](#adding-https-support)
      1. [**Create a SSL key**](#create-a-ssl-key)
   10. [**Add a ping route**](#add-a-ping-route)
   11. [**Storing Data**](#storing-data)
         1. [**Creating file and storing data**](#creating-file-and-storing-data)
         2. [**Reading Data**](#reading-data)
         3. [**Updating Data**](#updating-data)
         4. [**Deleting File**](#deleting-file)
3. [**GUI**](#gui)
4. [**CLI**](#cli)
5. [**Stability**](#stability)
6. [**Performance**](#performance)
7. [**Loose Ends**](#loose-ends)

# **Background Information**

## **History of Node**

Developed by Ryan Dahl.

### **2009**

-   First Presentation on November 2009.
-   Got standing occasion but no one was ready to use it.
-   MongoDB was also created which again no one was ready to switch to due to all frameworks having their choice of SQL databases.

### **2010**

-   Isaac Schlueter created NPM in January 2010
-   Made sharing of libraries easier and developer-friendly.
-   Node being stable used to throw coagulated error messages.
-   Social media (Twitter) APIs began to popularize RESTful JSON APIs.
-   Developers have to learn JSON to store data and using them in the backend.
-   Was becoming more and more difficult due to the unstructured format
-   Frameworks was't supporting it out of the box.
-   Node and Mongo made working with JSON on backend much easier.
-   Node still wasn't getting main stream.
-   More and more users started building their projects in NodeJS which making the use of Node more and more clear.
-   Google released AngularJS on October 2010.
-   ExpressJS was released on November 2010 by TJ.

### **2011**

-   Mongoose was build on February 2011.
-   Working with AngularJS on Frontend, NodeJS on the back and Mongo with Mongoose for the database was making the job easier and time-saving.
-   MEAN stack was born.
-   Node to be used by itself was still difficult as it was single person's project and not many contributors.
-   For maintaining the progress of the project there was a need of some sponsors.
-   Joyent hired Ryan and was purchasing the name and Trademark of Node
-   Joyent promised stability, security and scaled-up efforts on Node core and toolings surrounding it.
-   Joyent with Microsoft released Node v0.6.0 included support for Windows.

### **2012**

-   Ryan stepped aside and promoted Isaac to lead Node.
-   Isaac deleted Node project and promoted TJ.

### **2015**

-   Node was popular.
-   Different groups of developments of node were formed (IO.js)
-   Node was taken away from Joyent's.
-   Node became a new neutral NodeJS foundation.
-   Allowed all groups to join and steer the project.
-   First non-beta version of Node was released by IO.js.
-   Node released v4.0.
-   Node wasn't popular on it's own but due to the tools (MEAN stack)
-   Developers were virtually unknown about Node. They knew Express, Angular, Mongoose but not Node and Mongo.
-   Developers abandoned Node.js API due to 3rd party libraries, frameworks, and NPM packages.

## **V8**

NodeJS is built on top of Chrome's V8 JavaScript Engine.

-   Modern computers only understand _Machine Code_ whereas developers write programs in _High Level_ languages.
-   To execute high-level code, computer uses: `Interpreter`, `Compilers` & `Transpilers`.
    -   **Compilers** - Converts source code into machine code and create executables.
    -   **Transpilers** - Takes source code of one type and converts it into source code of another type. eg. SASS -> CSS, Coffee Script -> JavaScript
    -   **Interpreters** - Directly runs source code by compiling parts of the code. But they don't leave behind anything eg. executables.
-   V8 compiles JavaScript into machine code and executes it.
-   Optimizes the code in runtime and make it faster.
-   It's a standalone application to which people rarely interact with.
-   It is inside of Chrome.
    -   Other JavaScript Engines:
        -   JavaScriptCore (iOS, Safari)
        -   SpiderMonkey (Firefox) - First ever JS Engine built by the creator of JavaScript. MongoDB uses both V8 and SpiderMonkey.
        -   Chakra (Internet Explorer)
    -   Web browsers embed JavaScript engines in order to execute JS.
    -   Browsers are built on top of JS Engines.
    -   NodeJS does the same. It embeds v8 in order to execute JS.

## **What is NodeJS?**

-   Server-side JavaScript runtime environment.
    -   **Server-side** - runs on an operating system
    -   **JavaScript runtime environment** - Application that looks at JavaScript. Sees when and what JS should be executed and sends it to an embedded JavaScript engines to execute on a computer.
-   Anatomy
    -   **V8** - Car's engine and drivetrain
    -   **NodeJS** - Everything else (seats, steering, etc)
    -   **NodeJS Developer** - Car driver.
-   C++ application, embeds v8
-   Now presents itself as two applications:
    -   **1. A script processor**
        -   calls the script processor with the script name. eg._` node index.js`_. Initializes an event loop, processes initial parts of your JavaScript file, Process event loop initialized earlier.
        -   **Event Loop** - infinitely repeating task, each pass/tic continuously checks if there's any new task to do by NodeJS.
        -   **What it does?**
            -   Reads in the file you specify.
            -   Reads in all the dependencies that file specifies, and all the dependencies of those files, etc.
            -   Begins executing the synchronous tasks in those files.
            -   Begins processing the "todo list" by repeating the event loop until it has nothing to do.
    -   **2. A REPL (Read Eval Print Loop)**
        -   **Invoke** - `node`
        -   Interactive JS runtime.
        -   Can write any JavaScript you want and execute it.
        -   **Process**
            -   Starts the event loop in the background.
            -   `Read` (waits) for you to write.
            -   `Executes` what you wrote.
            -   `Print` response or return value.
            -   `Loop` back up to top and repeat the process again.
-   It is single threaded - Only one task can run ata a time.
-   It is Non-blocking - Does some other tasks instead of waiting and later completes that task. eg. Node application sends data using API to be stored meanwhile it's waiting for it to be stored it can process other things. When the data is stored, it get's back to the previous task to complete.
-   It uses single entry point for executing with the help of modules that links to multiple individual files.
    Example:
    `fileB`

    ```js
    // Require fileA
    var myImportedFunction = require("fileA");

    // Use the foo function from fileA
    myImportedFunction.foo();
    ```

    `fileA`

    ```js
    // Create a lib object
    var lib = {};

    // Add a foo function to the lib
    lib.foo = function () {
        console.log("hello");
    };

    // Export the whole lib
    module.exports = lib;
    ```

## **Anatomy of NodeJS Application**

`index.js`

```javascript
// Dependencies
var mathLib = require("./lib/math");
var jokesLib = require("./lib/jokes");

// App object
var app = {};

// Configuration
app.config = {
    timeBetweenJokes: 1000,
};

// Function that prints a random joke
app.printAJoke = function () {
    // Get all the jokes
    var allJokes = jokesLib.allJokes();

    // Get the length of the jokes
    var numberOfJokes = allJokes.length;

    // Pick a random number between 1 and the number of jokes
    var randomNumber = mathLib.getRandomNumber(1, numberOfJokes);

    // Get the joke at that position in the array (minus one)
    var selectedJoke = allJokes[randomNumber - 1];

    // Send the joke to the console
    console.log(selectedJoke);
};

// Function that loops indefinitely, calling the printAJoke function as it goes
app.indefiniteLoop = function () {
    // Create the interval, using the config variable defined above
    setInterval(app.printAJoke, app.config.timeBetweenJokes);
};

// Invoke the loop
app.indefiniteLoop();
```

`lib/math.js`

```javascript
// App object
var math = {};

// Get a random integer between two integers
math.getRandomNumber = function (min, max) {
    min = typeof min == "number" && min % 1 === 0 ? min : 0;
    max = typeof max == "number" && max % 1 === 0 ? max : 0;
    return Math.floor(Math.random() * (max - min + 1) + min);
};

// Export the library
module.exports = math;
```

`lib/jokes/index.js`

```javascript
// Dependencies
var fs = require("fs");

// App object
var jokes = {};

// Get all the jokes and return them to the user
jokes.allJokes = function () {
    // Read the text file containing the jokes
    var fileContents = fs.readFileSync(__dirname + "/jokes.txt", "utf8");

    // Turn the string into an array
    var arrayOfJokes = fileContents.split(/\r?\n/);

    // Return the array
    return arrayOfJokes;
};

// Export the library
module.exports = jokes;
```

## **Common Node Conventions**

### `package.json`

-   Contains metadata of the node application.
-   Includes names of all the dependencies that are used in your node application.
-   Also contains scripts for running your node application.
-   It makes it easy to share your application without need of sending all the dependencies along with it.
-   Just run `npm install` and it will automatically install the packages/dependencies required by your application.

### `package-lock.json`

-   Gives you a detailed version of `package.json`
-   Also includes the exact versions you used in your node application.

### `Importing packages`

1. If the package is installed by npm, use `var NameToCall = require("packageName")` or `import NameToCall from "packageName";`
2. If the package is present in the application directory, use `var NameToCall = require("./packageName")` or `import NameToCall from "./packageName";`

### `Testing`

-   Testing files are stored in `/test` directory.
-   They are triggered by a test runner. _eg. Mocha_
-   Common Testing Files: `.travis.yml`, `.jshintrc`.
-   General-purpose (eg. Grunt and Gulp) task runners often control whole process.

### `Documentation & Source Control`

-   Most popular are Git & GitHub.
-   You'll see `.git` and `.gitignore` files in projects.
-   You'll also see a `readme.md` file which describes the project.
-   Common Code-Comments:
    -   @Param - description of each parameter to be passed to the function.
    -   @TODO - Indicate feature developer is working on or need to work on
    -   @Author - Indicates who wrote the certain line of code
    -   @Date

### `Environments & Configuration`

-   Option 1
    -   Start your app with `NODE_ENV=myEnvironmentName node index.js`.
    -   Put your configuration in a file which has a switch inside of it. _eg. config.js_
    -   That switch should read `process.env.NODE_ENV` to determine the environment, and export only the config variables for that environment.
-   Option 2
    -   Start your app with every configure variable you're going to need for that environment. `DBpassword=myDBpassword apiToken=mySecretToken port=thePortIShouldRunOn foo=bar node index.js`
    -   Configurations doesn't get committed to the source code.
    -   Testing becomes easy.
    -   No code needs to be changed when you want to use a different environment configurations.
-   Option 3
    -   Read all your configuration from a .env file which gets ignored by source code.
    -   Each dev would put their own .env file in the project prior to beginning localhost work.
    -   Your deployment pipeline would insert an .env file into the repo before it deploys anywhere.

### `Styles and Patterns`

-   Airbnb's JavaScript Style Guide is most popular in NodeJS developers.
-   Linters (jshint and jslint) also inform the syntax many developers use.

### `Error Handling`

Has three components

-   Errback
    -   Convention popular by Express.
    -   Every callback's first parameter is an error parameter which should come back as null, undefined or false if no error.
-   Avoid Throwing Exceptions
    -   An uncaught exception takes down the entire thread, and kills the app.
-   Avoid Globals
    -   This will avoid namespace collisions with any libraries you may be using.

## **NodeJS vs Browser/Window**

### `Possible only in Browser`

```
window.open                 document
window.location             document.body
window.navigator            onchange
window.origin               onclick
window.focus                onblur
window.blur                 oncopy
window.scroll               oncut
window.alert                onscroll
window.localstorage         onmouseenter
window.onload               onmouseleave
```

### `Possible with Node`

```
Writing to the file system
Interacting with the operating system
```

-   Node is one environment. No issue in Cross-Platform.
-   The browser is many. Might be differences in Cross-browser.
-   Node's source code is not visible to the end user.

# **RESTful API**

We will be creating a RESTful API for an _Uptime Monitoring System_

API should allow:

1. Listens on a PORT and accepts incoming HTTP requests for POST, GET, PUT, DELETE and HEAD.
2. Allows a client to connect, then create a new user, then edit and delete that user.
3. Allows a user to "Sign In" which gives them a token that they can use for subsequent authenticated request.
4. Allows the user to "Sign Out" which invalidates their token.
5. Allows a signed-in user to use their token to create a new "Check" (Limited to 5).
6. Allows a signed-in user to edit or delete any of their checks.
7. In the background, workers perform all the "Checks" at the appropriate times, and send alerts to the users when a check changes its state from "Up" to "Down", or vise versa.

## **Creating a Server**

`index.js`

```javascript
// Dependencies
var http = require("http");

// The server should respond to all requests with a string
var server = http.createServer(function (req, res) {
    res.end("Hello World\n");
});

// Start the server, and have it listen on port 3000
server.listen(3000, function () {
    console.log("The server is listening on port 3000 now");
});
```

Run: `node index.js`
**Test:** `curl localhost:3000`

## **Parsing Request Paths**

`index.js`

```javascript
...
var url = require("url");

// The server should respond to all requests with a string
var server = http.createServer(function (req, res) {
    // Get the URL and parse it
    var parsedUrl = url.parse(req.url, true);

    // Get the path
    var path = parsedUrl.pathname; // gives untrimmed path eg. `/foo/`
    // trim slashes eg.`/foo/ -> foo` & `/foo/bar -> foo/bar`
    var trimmedPath = path.replace(/\/+|\/+$/g, "");

    // Send the response
    res.end("Hello World\n");

    // Log the request path
    console.log("Request is received on path: " + trimmedPath);
});
...
```

Run: `node index.js`
**Test:**
`curl localhost:3000` -> `Request is received on path: `
`curl localhost:3000/foo` -> `Request is received on path: foo`
`curl localhost:3000/foo/bar` -> `Request is received on path: foo/bar`

## **Parsing HTTP Methods**

`index.js`

```javascript
...
// Get the HTTP method
var method = req.method.toLowerCase();

...

// Log the request path
console.log("Request is received on path: " + trimmedPath + " with method: " + method);
...
```

Run: `node index.js`
**Test:** `curl localhost:3000/foo?fizz=buzz` ->

**Output**
`Request is received on path: foo with method: get`

## **Parsing Query Strings**

`index.js`

```javascript
...
// Get the query string as an object
var queryString = parsedUrl.query;

...

// Log the request path
console.log(
    "Request is received on path: " +
        trimmedPath +
        " with method: " +
        method +
        " and with these query string parameters ",
    queryString
);

...
```

Run: `node index.js`
**Test:** `curl localhost:3000/foo?fizz=buzz` ->
**Output**
`Request is received on path: foo with method: get and with these query string parameters [Object: null prototype] { fizz: 'buzz' }`

## **Parsing Request Headers**

`index.js`

```javascript
// Get the Headers as an object
var headers = req.headers;
...
// Log the request path
console.log("Request is received with these headers ", headers);
```

Run: `node index.js`
**Test:** Launch Postman, write a get request to `localhost:3000` and add headers as `foo: bar`, `fizz: buzz`, `apples: oranges`, `red: blue`
**Output**

```
Request is received with these headers
{
  foo: 'bar',
  fizz: 'buzz',
  apples: 'oranges',
  red: 'blue',
  'cache-control': 'no-cache',
  'postman-token': 'ce8cc114-1e50-4777-9395-16cfeaf3a506'
}
```

## **Parsing Payloads**

`index.js`

```javascript
// Dependencies
...
var stringDecoder = require("string_decoder").StringDecoder;

// The server should respond to all requests with a string
var server = http.createServer(function (req, res) {
    ...

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

        // Send the response
        res.end("Hello World\n");

        // Log the request path
        console.log(
            "Request is received on path: " +
                trimmedPath +
                " with method: " +
                method +
                " and with these query string parameters ",
            queryString,
            " header ",
            headers,
            " and payload ",
            buffer
        );
    });
});
...
```

Run: `node index.js`
**Test:** Launch Postman, write a get request to `localhost:3000` navigate to the Body, select the `raw` as `Text` and add any text inside the body as payload eg. `This is the body we are sending`
**Output**

```
Request is received on path:  with method: post and with these query string parameters  [Object: null prototype] {}  header  {
  'content-type': 'text/plain',
  'cache-control': 'no-cache',
  'postman-token': 'e1a6bd1b-fbfd-422f-abe6-6e9c90d58557',
  'content-length': '32'
}  and payload  This is the body we are sending.
```

## **Routing Requests**

`index.js`

```javascript
// The server should respond to all requests with a string
var server = http.createServer(function (req, res) {
    ...
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
            payload: buffer,
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
});

// Define the handlers
var handlers = {};

// Sample handler
handlers.sample = function (data, callback) {
    // callback a http status code, and a payload object
    callback(406, { name: "sample handler" });
};

// Not found handler
handlers.notFound = function (data, callback) {
    callback(404);
};

// Define a request router
var router = {
    sample: handlers.sample,
};

```

Run: `node index.js`
**Test:** Launch Postman, write a get request to `localhost:3000`, `localhost:3000/sample` & `localhost:3000/sample/foo`
**Output**
`localhost:3000` -> `Returning this response: 404 {}`
`localhost:3000/sample` -> `Returning this response: 406 {"name":"sample handler"}`
`localhost:3000/sample/foo` -> `Returning this response: 404 {}`

## **Adding Configuration**

`config.js`

```javascript
/*
 * Create and export configuration variables
 */

// Container for all the environments
var environments = {};

// Staging (default) environment
environments.staging = {
    port: 3000,
    envName: "staging",
};

// Production environment
environments.production = {
    port: 5000,
    envName: "production",
};

// Determine which environment was passed as a command-line argument
var currentEnvironment =
    typeof process.env.NODE_ENV == "string"
        ? process.env.NODE_ENV.toLowerCase()
        : "";

// Check that the current environment is one of the environment above, if not, default to staging
var environmentToExport =
    typeof environments[currentEnvironment] == "object"
        ? environments[currentEnvironment]
        : environments.staging;

// Export the module
module.exports = environmentToExport;
```

`index.js`

```javascript
var config = require("./config");
...
// Start the server
server.listen(config.port, function () {
    console.log(
        "The server is listening on port " +
            config.port +
            " in " +
            config.envName +
            " mode"
    );
});
...
```

Run: `node index.js` and `NODE_ENV=production node index.js`

**Output**
`node index.js` -> `The server is listening on port 3000 in staging`
`NODE_ENV=production node index.js` -> `The server is listening on port 5000 in production`

## **Adding HTTPS Support**

### **Create a SSL key**

```bash
mkdir https
cd https
openssl req -newkey rsa:2014 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
```

-   http works on 80
-   https works on 443

`config.js`

```javascript
...
// Staging (default) environment
environments.staging = {
    httpPort: 3000,
    httpsPort: 3001,
    envName: "staging",
};

// Production environment
environments.production = {
    httpPort: 5000,
    httpsPort: 5001,
    envName: "production",
};
...
```

`index.js` (Refactored)

```javascript
...
var https = require("https");
var fs = require("fs");

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

// Start the HTTP server
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
            payload: buffer,
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

// Define the handlers
var handlers = {};

// Sample handler
handlers.sample = function (data, callback) {
    // callback a http status code, and a payload object
    callback(406, { name: "sample handler" });
};

// Not found handler
handlers.notFound = function (data, callback) {
    callback(404);
};

// Define a request router
var router = {
    sample: handlers.sample,
};
```

**Test:**

`node index.js`
**Console Response:**

```
The server is listening on port 3000 in staging mode
The server is listening on port 3001 in staging mode
```

Open `localhost:3000/sample`
**Browser Response:**

```json
{
    "name": "Sample handler"
}
```

**Console Response:**

```
Returning this response:  406 {"name":"sample handler"}
```

Open `https://localhost:3001/sample`
**Browser Response:**

```json
{
    "name": "Sample handler"
}
```

---

`node index.js`
**Console Response:**

```
Returning this response:  406 {"name":"sample handler"}
```

```
The server is listening on port 3000 in staging mode
The server is listening on port 3001 in staging mode
```

## **Add a ping route**

`index.js`

```javascript
...
// Ping handler
handlers.ping = function (data, callback) {
    callback(200);
};
...
// Define a request router
var router = {
    ...
    ping: handlers.ping,
};
```

**Run:** `node index.js`
**Test:** Open `localhost:3000/ping`
**Output:** Response `{}` with status code 200.

## **Storing Data**

```bash
mkdir .data
mkdir lib
touch lib/data.js
```

**For testing purpose**

#### **Creating file and storing data**

`index.js`

```javascript
...
var _data = require("./lib/data");

_data.create("test", "newFile", { foo: "bar" }, function (err) {
    console.log("This was the error ", err);
});
...
```

**Run:** `node index.js` twice
**Output:**
`This was the error false`
`This was the error Could not read new file, it may already exist`

#### **Reading Data**

`index.js`

```javascript
...
_data.read("test", "newFile", function (err, data) {
    console.log("This was the error ", err, " and this was the data ", data);
});
...
```

**Run:** `node index.js`
**Output:** `This was the error null and this was the data {"foo":"bar"}`

#### **Updating Data**

`index.js`

```javascript
...
_data.update("test", "newFile", { fizz: "buzz" }, function (err) {
    console.log("This was the error ", err);
});
...
```

**Run:** `node index.js`

#### **Deleting File**

`index.js`

```javascript
...
_data.delete("test", "newFile", function (err) {
    console.log("This was the error ", err);
});
...
```

**Run:** `node index.js`
**Output** `This was the error false`

# **GUI**

# **CLI**

# **Stability**

# **Performance**

# **Loose Ends**
