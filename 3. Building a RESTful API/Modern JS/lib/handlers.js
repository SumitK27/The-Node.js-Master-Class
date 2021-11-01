/*
 * This are the request handlers
 */

// Dependencies
var _data = require("./data");
var helpers = require("./helpers");

// Define a handlers
const handlers = {};

// Sample handler
handlers.sample = (data, callback) => {
    // Callback a HTTP status code and a payload object
    callback(406, { name: "Sample Handler" });
};

// Ping handler
handlers.ping = (data, callback) => {
    callback(200);
};

// Users
handlers.users = (data, callback) => {
    const acceptableMethods = ["POST", "GET", "PUT", "DELETE"];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for all the users methods
handlers._users = {};

// Users - POST
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.POST = (data, callback) => {
    // Check that all required fields are filled out
    const firstName =
        typeof data.payload.firstName === "string" &&
        data.payload.firstName.trim().length > 0
            ? data.payload.firstName.trim()
            : false;
    const lastName =
        typeof data.payload.lastName === "string" &&
        data.payload.lastName.trim().length > 0
            ? data.payload.lastName.trim()
            : false;
    const phone =
        typeof data.payload.phone === "string" &&
        data.payload.phone.trim().length === 10
            ? data.payload.phone.trim()
            : false;
    const password =
        typeof data.payload.password === "string" &&
        data.payload.password.trim().length > 0
            ? data.payload.password.trim()
            : false;
    const tosAgreement =
        typeof data.payload.tosAgreement === "boolean" &&
        data.payload.tosAgreement === true
            ? true
            : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure that the user doesn't already exists
        _data.read("users", phone, (err, data) => {
            if (firstName && lastName && phone && password && tosAgreement) {
                // Make sure that the user doesn't already exists
                _data.read("users", phone, (err, data) => {
                    if (err) {
                        // Hash the password
                        const hashedPassword = helpers.hash(password);

                        // Create the user object
                        if (hashedPassword) {
                            const userObject = {
                                firstName,
                                lastName,
                                phone,
                                hashedPassword,
                                tosAgreement: true,
                            };

                            // Store the user
                            _data.create("users", phone, userObject, (err) => {
                                if (!err) {
                                    callback(200);
                                } else {
                                    console.log(err);
                                    callback(500, {
                                        Error: "Could not create the new user",
                                    });
                                }
                            });
                        } else {
                            callback(500, {
                                Error: "Could not hash the user's password.",
                            });
                        }
                    } else {
                        // User already exists
                        callback(400, {
                            Error: "A user with that phone number already exists",
                        });
                    }
                });
            } else {
                callback(400, { Error: "Missing required fields" });
            }
        });
    } else {
        callback(400, { Error: "Missing required fields" });
    }
};

// Users - GET
// Required data: phone
// Optional data: none
// TODO Only let an authenticated user access their object. Dont let them access anyone elses.
handlers._users.GET = (data, callback) => {
    // Check that phone number is valid
    const phone =
        typeof data.queryString.phone === "string" &&
        data.queryString.phone.trim().length === 10
            ? data.queryString.phone.trim()
            : false;
    if (phone) {
        // Lookup the user
        _data.read("users", phone, (err, data) => {
            if (!err && data) {
                // Remove the hashed password from the user user object before returning it to the requester
                delete data.hashedPassword;
                callback(200, data);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, { Error: "Missing required field" });
    }
};

// Users - PUT
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// TODO Only let an authenticated user up their object. Dont let them access update elses.
handlers._users.PUT = (data, callback) => {
    // Check for required field
    const phone =
        typeof data.payload.phone == "string" &&
        data.payload.phone.trim().length === 10
            ? data.payload.phone.trim()
            : false;

    // Check for optional fields
    const firstName =
        typeof data.payload.firstName === "string" &&
        data.payload.firstName.trim().length > 0
            ? data.payload.firstName.trim()
            : false;
    const lastName =
        typeof data.payload.lastName === "string" &&
        data.payload.lastName.trim().length > 0
            ? data.payload.lastName.trim()
            : false;
    const password =
        typeof data.payload.password === "string" &&
        data.payload.password.trim().length > 0
            ? data.payload.password.trim()
            : false;

    // Error if phone is invalid
    if (phone) {
        // Error if nothing is sent to update
        if (firstName || lastName || password) {
            // Lookup the user
            _data.read("users", phone, (err, userData) => {
                if (!err && userData) {
                    // Update the fields if necessary
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (password) {
                        userData.password = password;
                    }

                    // Store the new updates
                    _data.update("users", phone, userData, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {
                                Error: "Could not update the user.",
                            });
                        }
                    });
                } else {
                    callback(400, { Error: "Specified user does not exists." });
                }
            });
        } else {
            callback(400, { Error: "Missing fields to update." });
        }
    } else {
        callback(400, { Error: "Missing required field" });
    }
};

// Users - DELETE
// Required data: phone
// TODO Only let an authenticated user delete their object. Dont let them delete update elses.
// TODO Cleanup (delete) any other data files associated with the user
handlers._users.DELETE = (data, callback) => {
    // Check that phone number is valid
    const phone =
        typeof data.queryString.phone === "string" &&
        data.queryString.phone.trim().length === 10
            ? data.queryString.phone.trim()
            : false;

    if (phone) {
        // Lookup the user
        _data.read("users", phone, (err, data) => {
            if (!err && data) {
                _data.delete("users", phone, (err) => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {
                            Error: "Could not delete the specified user",
                        });
                    }
                });
            } else {
                callback(400, { Error: "Could not find the specified user." });
            }
        });
    } else {
        callback(400, { Error: "Missing required field" });
    }
};

// Tokens
handlers.tokens = (data, callback) => {
    const acceptableMethods = ["POST", "GET", "PUT", "DELETE"];
    console.log(data.method);
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for token sub methods
handlers._tokens = {};

// Tokens - POST
// Required data: phone (string), password(string)
// Optional data: none
handlers._tokens.POST = (data, callback) => {
    const phone =
        typeof data.payload.phone === "string" &&
        data.payload.phone.trim().length === 10
            ? data.payload.phone.trim()
            : false;
    const password =
        typeof data.payload.password === "string" &&
        data.payload.password.trim().length > 0
            ? data.payload.password.trim()
            : false;

    if (phone && password) {
        // Lookup the user that matches that phone number
        _data.read("users", phone, (err, userData) => {
            if (!err && userData) {
                // Hash the sent password and compare it to the user object
                const hashedPassword = helpers.hash(password);

                // If password matches
                if (hashedPassword === userData.hashedPassword) {
                    // If valid then create a token with valid name.
                    const tokenId = helpers.createRandomString(20);

                    // Set expiration data 1 hour in the future
                    const expires = Date.now() + 1000 * 60 * 60;

                    // Create the token object
                    const tokenObject = {
                        phone,
                        id: tokenId,
                        expires,
                    };

                    // Store the token
                    _data.create("tokens", tokenId, tokenObject, (err) => {
                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, {
                                Error: "Could not create the new token",
                            });
                        }
                    });
                } else {
                    callback(400, {
                        Error: "Password did not matched the specified user's stored password",
                    });
                }
            } else {
                callback(400, { Error: "Could not found the specified user" });
            }
        });
    } else {
        callback(400, { Error: "Missing required field(s)" });
    }
};

// Not found handler
handlers.notFound = (data, callback) => {
    callback(404);
};

// Export Module
module.exports = handlers;
