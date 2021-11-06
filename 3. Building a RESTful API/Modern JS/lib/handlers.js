/*
 * This are the request handlers
 */

// Dependencies
var _data = require("./data");
var helpers = require("./helpers");
var config = require("./config");

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
// Required data: firstName (string), lastName (string), phone (string), password (string), tosAgreement (boolean)
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
// Required data: phone (string)
// Optional data: none
handlers._users.GET = (data, callback) => {
    // Check that phone number is valid
    const phone =
        typeof data.queryString.phone === "string" &&
        data.queryString.phone.trim().length === 10
            ? data.queryString.phone.trim()
            : false;
    if (phone) {
        // Get the token from the headers
        const token =
            typeof data.headers.token === "string" ? data.headers.token : false;

        // Verify that the given token from the header is valid for the phone number
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                // Lookup the user
                _data.read("users", phone, (err, data) => {
                    if (!err && data) {
                        // Remove the hashed password from the user user object before returning it to the requester
                        delete data.hashedPassword;
                        callback(200, data);
                    } else {
                        callback(404, { Error: "User not found" });
                    }
                });
            } else {
                callback(403, {
                    Error: "Missing required token in the header, or token is invalid",
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
            // Get the token from the headers
            var token =
                typeof data.headers.token == "string"
                    ? data.headers.token
                    : false;

            // Verify that the given token from the header is valid for the phone number
            handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                if (tokenIsValid) {
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
handlers._users.DELETE = (data, callback) => {
    // Check that phone number is valid
    const phone =
        typeof data.queryString.phone === "string" &&
        data.queryString.phone.trim().length === 10
            ? data.queryString.phone.trim()
            : false;

    if (phone) {
        // Get token from headers
        const token =
            typeof data.headers.token === "string" ? data.headers.token : false;

        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                // Lookup the user
                _data.read("users", phone, (err, userData) => {
                    if (!err && userData) {
                        _data.delete("users", phone, (err) => {
                            if (!err) {
                                // Delete each checks associated with the user
                                var userChecks =
                                    typeof userData.checks == "object" &&
                                    userData.checks instanceof Array
                                        ? userData.checks
                                        : [];
                                var checksToDelete = userChecks.length;
                                if (checksToDelete > 0) {
                                    var checksDeleted = 0;
                                    var deletionErrors = false;

                                    // Loop through the checks
                                    userChecks.forEach((checkId) => {
                                        // Delete the check
                                        _data.delete(
                                            "checks",
                                            checkId,
                                            (err) => {
                                                if (err) {
                                                    deletionErrors = true;
                                                }
                                                checksDeleted++;

                                                if (
                                                    checksDeleted ==
                                                    checksToDelete
                                                ) {
                                                    if (!deletionErrors) {
                                                        callback(200);
                                                    } else {
                                                        callback(500, {
                                                            Error: "Errors encountered while attempting to delete all of the user's checks. All checks may not have been deleted from the system successfully.",
                                                        });
                                                    }
                                                }
                                            }
                                        );
                                    });
                                } else {
                                    callback(200);
                                }
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
handlers.tokens = (data, callback) => {
    const acceptableMethods = ["POST", "GET", "PUT", "DELETE"];
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

// Tokens - GET
// Required data: id (string)
// Optional data: none
handlers._tokens.GET = (data, callback) => {
    // Check if the ID is valid
    const id =
        typeof data.queryString.id === "string" &&
        data.queryString.id.trim().length === 20
            ? data.queryString.id.trim()
            : false;

    if (id) {
        // Lookup the user
        _data.read("tokens", id, (err, tokenData) => {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404, { Error: "Token not found" });
            }
        });
    } else {
        callback(400, { Error: "Missing required field" });
    }
};

// Tokens - PUT
// Required data: id (string), extend (boolean)
// Optional data: none
handlers._tokens.PUT = (data, callback) => {
    const id =
        typeof data.payload.id === "string" &&
        data.payload.id.trim().length === 20
            ? data.payload.id.trim()
            : false;
    const extend =
        typeof data.payload.extend === "boolean" && data.payload.extend === true
            ? true
            : false;

    if (id && extend) {
        // Lookup the token
        _data.read("tokens", id, (err, tokenData) => {
            if (!err && tokenData) {
                // Check if token isn't already expired
                if (tokenData.expires > Date.now()) {
                    // Set expiration and hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    // Store the new expiration
                    _data.update("tokens", id, tokenData, (err) => {
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
handlers._tokens.DELETE = (data, callback) => {
    // Check that the ID is valid
    const id =
        typeof data.queryString.id === "string" &&
        data.queryString.id.trim().length === 20
            ? data.queryString.id.trim()
            : false;

    if (id) {
        // Lookup the token
        _data.read("tokens", id, (err, data) => {
            if (!err && data) {
                _data.delete("tokens", id, (err) => {
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
handlers._tokens.verifyToken = (id, phone, callback) => {
    // Lookup the token
    _data.read("tokens", id, (err, tokenData) => {
        if (!err && tokenData) {
            // Check that the token is for the given user and has not expired
            if (tokenData.phone === phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

// Checks
handlers.checks = (data, callback) => {
    const acceptableMethods = ["POST", "GET", "PUT", "DELETE"];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, callback);
    } else {
        callback(405, { Error: "Invalid Method" });
    }
};

// Container for all the check methods
handlers._checks = {};

// Checks - POST
// Required data: protocol (string), url (string), method (string), successCodes (array), timeoutSeconds (number)
// Optional data: none
handlers._checks.POST = (data, callback) => {
    // Validate inputs
    const protocol =
        typeof data.payload.protocol === "string" &&
        ["https", "http"].indexOf(data.payload.protocol) > -1
            ? data.payload.protocol
            : false;
    const url =
        typeof data.payload.url === "string" &&
        data.payload.url.trim().length > 0
            ? data.payload.url.trim()
            : false;
    const method =
        typeof data.payload.method === "string" &&
        ["post", "get", "put", "delete"].indexOf(data.payload.method) > -1
            ? data.payload.method
            : false;
    const successCodes =
        typeof data.payload.successCodes === "object" &&
        data.payload.successCodes instanceof Array &&
        data.payload.successCodes.length > 0
            ? data.payload.successCodes
            : false;
    const timeoutSeconds =
        typeof data.payload.timeoutSeconds === "number" &&
        data.payload.timeoutSeconds % 1 === 0 &&
        data.payload.timeoutSeconds >= 1 &&
        data.payload.timeoutSeconds <= 5
            ? data.payload.timeoutSeconds
            : false;

    // If all inputs are valid
    if (protocol && url && method && successCodes && timeoutSeconds) {
        // Get the token from the headers
        const token =
            typeof data.headers.token === "string" ? data.headers.token : false;

        // Lookup the user by reading the token
        _data.read("tokens", token, (err, tokenData) => {
            if (!err && tokenData) {
                const userPhone = tokenData.phone;

                // Lookup the user data
                _data.read("users", userPhone, (err, userData) => {
                    if (!err && userData) {
                        const userChecks =
                            typeof userData.checks === "object" &&
                            userData.checks instanceof Array
                                ? userData.checks
                                : [];

                        // Verify that user has less than the number of max-checks per user
                        if (userChecks.length < config.maxChecks) {
                            // Create a random ID for the check
                            const checkId = helpers.createRandomString(20);

                            // Create the check object, and include user's phone
                            const checkObject = {
                                id: checkId,
                                userPhone: userPhone,
                                protocol: protocol,
                                url: url,
                                method: method,
                                successCodes: successCodes,
                                timeoutSeconds: timeoutSeconds,
                            };

                            // Save the data
                            _data.create(
                                "checks",
                                checkId,
                                checkObject,
                                (err) => {
                                    if (!err) {
                                        // Add the checkId to the users object
                                        userData.checks = userChecks;
                                        userData.checks.push(checkId);

                                        // Save the new user data
                                        _data.update(
                                            "users",
                                            userPhone,
                                            userData,
                                            (err) => {
                                                if (!err) {
                                                    // Return the data about the new check
                                                    callback(200, checkObject);
                                                } else {
                                                    callback(500, {
                                                        Error: "Could not update the user with the new check",
                                                    });
                                                }
                                            }
                                        );
                                    } else {
                                        callback(500, {
                                            Error: "Could not create the new check",
                                        });
                                    }
                                }
                            );
                        } else {
                            callback(400, {
                                Error:
                                    "The user already has the maximum number of checks (" +
                                    config.maxChecks +
                                    ")",
                            });
                        }
                    } else {
                        callback(400, {
                            Error: "Invalid Token or User not found",
                        });
                    }
                });
            } else {
                callback(403, { Error: "Not Authorized" });
            }
        });
    } else {
        callback(400, { Error: "Invalid inputs" });
    }
};

// Checks - GET
// Required data: [Query] id (string), [Header] token (string)
// Optional data: none
handlers._checks.GET = (data, callback) => {
    const id =
        typeof data.queryString.id === "string" &&
        data.queryString.id.trim().length === 20
            ? data.queryString.id.trim()
            : false;

    if (id) {
        // Lookup the check
        _data.read("checks", id, (err, checkData) => {
            if (!err) {
                // Get the token from the headers
                const token =
                    typeof data.headers.token === "string"
                        ? data.headers.token
                        : false;

                // Verify that the given token from the header is valid and belongs to the user who created the check
                handlers._tokens.verifyToken(
                    token,
                    checkData.userPhone,
                    (tokenIsValid) => {
                        if (tokenIsValid) {
                            // Return the check data
                            callback(200, checkData);
                        } else {
                            callback(403);
                        }
                    }
                );
            } else {
                callback(404, { Error: "Check doesn't exists" });
            }
        });
    } else {
        callback(400, { Error: "Missing required field" });
    }
};

// Checks - PUT
// Required data: id (string)
// Optional data: protocol (string), url (string), method (string), successCodes (Array), timeoutSeconds (number)
handlers._checks.PUT = (data, callback) => {
    // Check for required field
    const id =
        typeof data.payload.id === "string" &&
        data.payload.id.trim().length === 20
            ? data.payload.id.trim()
            : false;

    // Check for optional fields
    const protocol =
        typeof data.payload.protocol === "string" &&
        ["https", "http"].indexOf(data.payload.protocol) > -1
            ? data.payload.protocol
            : false;
    const url =
        typeof data.payload.url === "string" &&
        data.payload.url.trim().length > 0
            ? data.payload.url.trim()
            : false;
    const method =
        typeof data.payload.method === "string" &&
        ["post", "get", "put", "delete"].indexOf(data.payload.method) > -1
            ? data.payload.method
            : false;
    const successCodes =
        typeof data.payload.successCodes === "object" &&
        data.payload.successCodes instanceof Array &&
        data.payload.successCodes.length > 0
            ? data.payload.successCodes
            : false;
    const timeoutSeconds =
        typeof data.payload.timeoutSeconds === "number" &&
        data.payload.timeoutSeconds % 1 === 0 &&
        data.payload.timeoutSeconds >= 1 &&
        data.payload.timeoutSeconds <= 5
            ? data.payload.timeoutSeconds
            : false;

    // Check to make sure ID is valid
    if (id) {
        // Check to make sure one or more optional fields has been sent
        if (protocol || url || method || successCodes || timeoutSeconds) {
            // Lookup the check
            _data.read("checks", id, (err, checkData) => {
                if (!err && checkData) {
                    // Get token from Header
                    const token =
                        typeof data.headers.token === "string"
                            ? data.headers.token
                            : false;

                    // Verify token is valid and belongs to user who created the check
                    handlers._tokens.verifyToken(
                        token,
                        checkData.userPhone,
                        (tokenIsValid) => {
                            if (tokenIsValid) {
                                // Update the check where necessary
                                if (protocol) {
                                    checkData.protocol = protocol;
                                }
                                if (url) {
                                    checkData.url = url;
                                }
                                if (method) {
                                    checkData.method = method;
                                }
                                if (successCodes) {
                                    checkData.successCodes = successCodes;
                                }
                                if (timeoutSeconds) {
                                    checkData.timeoutSeconds = timeoutSeconds;
                                }

                                // Store the updates
                                _data.update("checks", id, checkData, (err) => {
                                    if (!err) {
                                        callback(200);
                                    } else {
                                        callback(500, {
                                            Error: "Could not update the check",
                                        });
                                    }
                                });
                            } else {
                                callback(403, { Error: "Invalid token" });
                            }
                        }
                    );
                } else {
                    callback(400, { Error: "Invalid Check ID" });
                }
            });
        } else {
            callback(400, { Error: "Missing fields to update" });
        }
    } else {
        callback(400, { Error: "Missing Check ID" });
    }
};

// Checks - DELETE
// Required data: id (string)
// Optional data: none
handlers._checks.DELETE = (data, callback) => {
    const id =
        typeof data.queryString.id === "string" &&
        data.queryString.id.trim().length === 20
            ? data.queryString.id.trim()
            : false;

    if (id) {
        // Lookup the checks
        _data.read("checks", id, (err, checkData) => {
            if (!err && checkData) {
                // Get token from Headers
                const token =
                    typeof data.headers.token === "string"
                        ? data.headers.token
                        : false;

                // Verify token is valid for user
                handlers._tokens.verifyToken(
                    token,
                    checkData.userPhone,
                    (tokenIsValid) => {
                        if (tokenIsValid) {
                            // Delete the check data
                            _data.delete("checks", id, (err) => {
                                if (!err) {
                                    // Lookup the user
                                    _data.read(
                                        "users",
                                        checkData.userPhone,
                                        (err, userData) => {
                                            if (!err && userData) {
                                                const userChecks =
                                                    typeof userData.checks ===
                                                        "object" &&
                                                    userData.checks instanceof
                                                        Array
                                                        ? userData.checks
                                                        : [];

                                                // Remove check from user
                                                const checkPosition =
                                                    userChecks.indexOf(id);

                                                if (checkPosition > -1) {
                                                    userChecks.splice(
                                                        checkPosition,
                                                        1
                                                    );

                                                    // Re-save the user's data
                                                    userData.checks =
                                                        userChecks;
                                                    _data.update(
                                                        "users",
                                                        checkData.userPhone,
                                                        userData,
                                                        (err) => {
                                                            if (!err) {
                                                                callback(200);
                                                            } else {
                                                                callback(500, {
                                                                    Error: "Can't update the user",
                                                                });
                                                            }
                                                        }
                                                    );
                                                } else {
                                                    callback(500, {
                                                        Error: "Can't find check on user, can't remove it",
                                                    });
                                                }
                                            } else {
                                                callback(500, {
                                                    Error: "Can't find user of the check, can't remove check of that user",
                                                });
                                            }
                                        }
                                    );
                                } else {
                                    callback(500, {
                                        Error: "Unable to delete the check",
                                    });
                                }
                            });
                        } else {
                            callback(403, {
                                Error: "Token is missing or invalid",
                            });
                        }
                    }
                );
            } else {
                callback(400, { Error: "Check does not exists" });
            }
        });
    } else {
        callback(400, { Error: "Missing Check ID" });
    }
};

// Not found handler
handlers.notFound = (data, callback) => {
    callback(404);
};

// Export Module
module.exports = handlers;
