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
// Required data: firstName (string), lastName (string), phone (string), password (string), tosAgreement (boolean)
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
// Required data: phone (string)
// Optional data: none
handlers._users.get = function (data, callback) {
    // Check that phone number is valid
    var phone =
        typeof data.queryString.phone == "string" &&
        data.queryString.phone.trim().length == 10
            ? data.queryString.phone.trim()
            : false;
    if (phone) {
        // Get the token from the headers
        var token =
            typeof data.headers.token == "string" ? data.headers.token : false;

        // Verify that the given token from the header is valid for the phone number
        handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
            if (tokenIsValid) {
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
                callback(403, {
                    Error: "Missing required token in header, or token is invalid",
                });
            }
        });
    } else {
        callback(400, { Error: "Missing required field" });
    }
};

// Users - PUT
// Required data: phone (string)
// Optional data: firstName, lastName, password (at least one must be specified)
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
            // Get the token from the headers
            var token =
                typeof data.headers.token == "string"
                    ? data.headers.token
                    : false;

            // Verify that the given token from the header is valid for the phone number
            handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
                if (tokenIsValid) {
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
                            _data.update(
                                "users",
                                phone,
                                userData,
                                function (err) {
                                    if (!err) {
                                        callback(200);
                                    } else {
                                        console.log(err);
                                        callback(500, {
                                            Error: "Could not update the user.",
                                        });
                                    }
                                }
                            );
                        } else {
                            callback(400, {
                                Error: "Specified user does not exists.",
                            });
                        }
                    });
                } else {
                    callback(403, {
                        Error: "Missing required token in header, or token is invalid",
                    });
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
// Required data: phone (string)
// TODO Cleanup (delete) any other data files associated with the user
handlers._users.delete = function (data, callback) {
    // Check that phone number is valid
    var phone =
        typeof data.queryString.phone == "string" &&
        data.queryString.phone.trim().length == 10
            ? data.queryString.phone.trim()
            : false;

    if (phone) {
        // Get token from headers
        var token =
            typeof data.headers.token == "string" ? data.headers.token : false;

        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
            if (tokenIsValid) {
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
                        callback(400, {
                            Error: "Could not find the specified user.",
                        });
                    }
                });
            } else {
                callback(403, {
                    Error: "Missing required token in header, or token is invalid.",
                });
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
// Required data: phone (string), password (string)
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
// Required data: id (string)
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

// Tokens - PUT
// Required data: id (string), extend (boolean)
// Optional data: none
handlers._tokens.put = function (data, callback) {
    var id =
        typeof data.payload.id == "string" &&
        data.payload.id.trim().length == 20
            ? data.payload.id.trim()
            : false;
    var extend =
        typeof data.payload.extend == "boolean" && data.payload.extend == true
            ? true
            : false;

    if (id && extend) {
        // Lookup the token
        _data.read("tokens", id, function (err, tokenData) {
            if (!err && tokenData) {
                // Check to make sure the token isn't already expired
                if (tokenData.expires > Date.now()) {
                    // Set expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    // Store the new updates
                    _data.update("tokens", id, tokenData, function (err) {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, {
                                Error: "Couldn't update the token's expiration",
                            });
                        }
                    });
                } else {
                    callback(400, {
                        Error: "The token has already expired and cannot be extended",
                    });
                }
            } else {
                callback(400, { Error: "Specified token does not exists" });
            }
        });
    } else {
        callback(400, {
            Error: "Missing required field(s) or fields are invalid",
        });
    }
};

// Tokens - DELETE
// Required data: id (string)
// Optional data: none
handlers._tokens.delete = function (data, callback) {
    // Check that the ID is valid
    var id =
        typeof data.queryString.id == "string" &&
        data.queryString.id.trim().length == 20
            ? data.queryString.id.trim()
            : false;

    if (id) {
        // Lookup the token
        _data.read("tokens", id, function (err, data) {
            if (!err && data) {
                _data.delete("tokens", id, function (err) {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {
                            Error: "Could not delete the specified token",
                        });
                    }
                });
            } else {
                callback(400, { Error: "Could not find the specified token." });
            }
        });
    } else {
        callback(400, { Error: "Missing required field" });
    }
};

// Verify if a given token ID is currently valid for a given user
handlers._tokens.verifyToken = function (id, phone, callback) {
    // Lookup the token
    _data.read("tokens", id, function (err, tokenData) {
        if (!err && tokenData) {
            // Check that the token is for the given user and has not expired
            if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

// Not found handler
handlers.notFound = function (data, callback) {
    callback(404);
};

// Export Module
module.exports = handlers;
