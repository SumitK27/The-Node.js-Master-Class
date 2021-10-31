/*
 * This are the request handlers
 */

// Dependencies
var _data = require("./data");
var helpers = require("./helpers");

// Define the handlers
var handlers = {};

// Sample handler
handlers.sample = function (data, callback) {
    // callback a http status code, and a payload object
    callback(406, { name: "sample handler" });
};

// Ping handler
handlers.ping = function (data, callback) {
    callback(200);
};

// Users
handlers.users = function (data, callback) {
    var acceptableMethods = ["post", "get", "put", "delete"];
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
handlers._users.post = function (data, callback) {
    // Check that all required fields are filled out
    var firstName =
        typeof data.payload.firstName == "string" &&
        data.payload.firstName.trim().length > 0
            ? data.payload.firstName.trim()
            : false;
    var lastName =
        typeof data.payload.lastName == "string" &&
        data.payload.lastName.trim().length > 0
            ? data.payload.lastName.trim()
            : false;
    var phone =
        typeof data.payload.phone == "string" &&
        data.payload.phone.trim().length == 10
            ? data.payload.phone.trim()
            : false;
    var password =
        typeof data.payload.password == "string" &&
        data.payload.password.trim().length > 0
            ? data.payload.password.trim()
            : false;
    var tosAgreement =
        typeof data.payload.tosAgreement == "boolean" &&
        data.payload.tosAgreement == true
            ? true
            : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure that the user doesn't already exists
        _data.read("users", phone, function (err, data) {
            if (firstName && lastName && phone && password && tosAgreement) {
                // Make sure the user doesn't already exist
                _data.read("users", phone, function (err, data) {
                    if (err) {
                        // Hash the password
                        var hashedPassword = helpers.hash(password);

                        // Create the user object
                        if (hashedPassword) {
                            var userObject = {
                                firstName: firstName,
                                lastName: lastName,
                                phone: phone,
                                hashedPassword: hashedPassword,
                                tosAgreement: true,
                            };

                            // Store the user
                            _data.create(
                                "users",
                                phone,
                                userObject,
                                function (err) {
                                    if (!err) {
                                        callback(200);
                                    } else {
                                        console.log(err);
                                        callback(500, {
                                            Error: "Could not create the new user",
                                        });
                                    }
                                }
                            );
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
handlers._users.get = function (data, callback) {
    // Check that phone number is valid
    var phone =
        typeof data.queryString.phone == "string" &&
        data.queryString.phone.trim().length == 10
            ? data.queryString.phone.trim()
            : false;
    if (phone) {
        // Lookup the user
        _data.read("users", phone, function (err, data) {
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
handlers._users.put = function (data, callback) {
    // Check for required field
    var phone =
        typeof data.payload.phone == "string" &&
        data.payload.phone.trim().length == 10
            ? data.payload.phone.trim()
            : false;

    // Check for optional fields
    var firstName =
        typeof data.payload.firstName == "string" &&
        data.payload.firstName.trim().length > 0
            ? data.payload.firstName.trim()
            : false;
    var lastName =
        typeof data.payload.lastName == "string" &&
        data.payload.lastName.trim().length > 0
            ? data.payload.lastName.trim()
            : false;
    var password =
        typeof data.payload.password == "string" &&
        data.payload.password.trim().length > 0
            ? data.payload.password.trim()
            : false;

    // Error if phone is invalid
    if (phone) {
        // Error if nothing is sent to update
        if (firstName || lastName || password) {
            // Lookup the user
            _data.read("users", phone, function (err, userData) {
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
                    _data.update("users", phone, userData, function (err) {
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
handlers._users.delete = function (data, callback) {
    // Check that phone number is valid
    var phone =
        typeof data.queryString.phone == "string" &&
        data.queryString.phone.trim().length == 10
            ? data.queryString.phone.trim()
            : false;

    if (phone) {
        // Lookup the user
        _data.read("users", phone, function (err, data) {
            if (!err && data) {
                _data.delete("users", phone, function (err) {
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
handlers.tokens = function (data, callback) {
    var acceptableMethods = ["post", "get", "put", "delete"];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for token sub methods
handlers._tokens = {};

// Tokens - POST
// Required data: phone, password
// Optional data: none
handlers._tokens.post = function (data, callback) {
    var phone =
        typeof data.payload.phone == "string" &&
        data.payload.phone.trim().length == 10
            ? data.payload.phone.trim()
            : false;
    var password =
        typeof data.payload.password == "string" &&
        data.payload.password.trim().length > 0
            ? data.payload.password.trim()
            : false;
    if (phone && password) {
        // Lookup the user that matches that phone number
        _data.read("users", phone, function (err, userData) {
            if (!err && userData) {
                // Hash the sent password and compare it to the user object
                var hashedPassword = helpers.hash(password);
                if (hashedPassword == userData.hashedPassword) {
                    // If valid then create a token with valid name.
                    var tokenId = helpers.createRandomString(20);

                    // Set expiration date 1 hour in the future
                    var expires = Date.now() + 1000 * 60 * 60;

                    // Create the token object
                    var tokenObject = {
                        phone: phone,
                        id: tokenId,
                        expires: expires,
                    };

                    // Store the token
                    _data.create(
                        "tokens",
                        tokenId,
                        tokenObject,
                        function (err) {
                            if (!err) {
                                callback(200, tokenObject);
                            } else {
                                callback(500, {
                                    Error: "Could not create the new token",
                                });
                            }
                        }
                    );
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

// Tokens - GET
// Required data: id
// Optional data: none
handlers._tokens.get = function (data, callback) {
    // Check that the sent ID is valid
    var id =
        typeof data.queryString.id == "string" &&
        data.queryString.id.trim().length == 20
            ? data.queryString.id.trim()
            : false;
    if (id) {
        // Lookup the user
        _data.read("tokens", id, function (err, tokenData) {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, { Error: "Missing required field" });
    }
};

// Not found handler
handlers.notFound = function (data, callback) {
    callback(404);
};

// Export Module
module.exports = handlers;
