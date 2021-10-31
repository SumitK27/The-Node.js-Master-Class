/*
 * Helpers for various tasks
 */

// Dependencies
var config = require("./config");
var crypto = require("crypto");

// Container for all the Helpers
var helpers = {};

// Create a SHA256 hash
helpers.hash = function (str) {
    if (typeof str == "string" && str.length > 0) {
        var hash = crypto
            .createHmac("sha256", config.hashingSecret)
            .update(str)
            .digest("hex");
        return hash;
    } else {
        return false;
    }
};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function (str) {
    try {
        var obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
};

// Create a string of random alphanumeric characters of a given length
helpers.createRandomString = function (srtLength) {
    srtLength =
        typeof srtLength == "number" && srtLength > 0 ? srtLength : false;
    if (srtLength) {
        // Define all the possible characters that could go into a string
        var possibleCharacters = "abcdefghijklmnopqurstuvwxyz0123456789";

        // Store the final string
        var str = "";

        for (var i = 0; i < srtLength; i++) {
            // Get random character from possible characters string
            var randomCharacter = possibleCharacters.charAt(
                Math.floor(Math.random() * possibleCharacters.length)
            );
            // Append this character to the final string
            str += randomCharacter;
        }

        // Return the final string
        return str;
    } else {
        return false;
    }
};

// Export the module
module.exports = helpers;
