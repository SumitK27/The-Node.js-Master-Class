/*
 * Helpers for various tasks
 */

// Dependencies
var config = require("./config");
var crypto = require("crypto");

// Container for all the Helpers
const helpers = {};

// Create a SHA256 hash
helpers.hash = (str) => {
    if (typeof str == "string" && str.length > 0) {
        const hash = crypto
            .createHmac("sha256", config.hashingSecret)
            .update(str)
            .digest("hex");
        return hash;
    } else {
        return false;
    }
};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = (str) => {
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
};

// Create a string of random alphanumeric characters of a given length
helpers.createRandomString = (strLength) => {
    strLength =
        typeof strLength === "number" && strLength > 0 ? strLength : false;

    if (strLength) {
        // Define all the possible characters that could go  into a string
        const possibleCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";

        // Store the final string
        let str = "";

        for (let i = 0; i < strLength; i++) {
            // Get random character from possible characters
            const randomCharacter = possibleCharacters.charAt(
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
