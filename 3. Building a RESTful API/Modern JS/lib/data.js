/*
 * Library for storing and editing data
 */

// Dependencies
const fs = require("fs");
const path = require("path");
const helpers = require("./helpers");

// Container for the module (to be exported)
const lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, "/../.data/");

// Write data to a file
lib.create = (dir, file, data, callback) => {
    // Open file for writing
    fs.open(
        lib.baseDir + dir + "/" + file + ".json",
        "wx",
        (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
                // Convert data to string
                const stringData = JSON.stringify(data);

                // Write to file and close it.
                fs.writeFile(fileDescriptor, stringData, (err) => {
                    if (!err) {
                        fs.close(fileDescriptor, (err) => {
                            if (!err) {
                                callback(false);
                            } else {
                                callback("Error Closing File!");
                            }
                        });
                    } else {
                        callback("Error Writing File!");
                    }
                });
            } else {
                callback("Could Not Read the File, it may already exist!");
            }
        }
    );
};

// Read a file
lib.read = (dir, file, callback) => {
    fs.readFile(
        lib.baseDir + dir + "/" + file + ".json",
        "utf8",
        (err, data) => {
            if (!err && data) {
                const parsedData = helpers.parseJsonToObject(data);
                callback(false, parsedData);
            } else {
                callback(err, data);
            }
        }
    );
};

// Update a file
lib.update = (dir, file, data, callback) => {
    fs.open(
        lib.baseDir + dir + "/" + file + ".json",
        "r+",
        (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
                // Convert data to string
                const stringData = JSON.stringify(data);

                // Truncate the file
                fs.ftruncate(fileDescriptor, (err) => {
                    if (!err) {
                        // Writing the file.
                        fs.writeFile(fileDescriptor, stringData, (err) => {
                            if (!err) {
                                // Close the file
                                fs.close(fileDescriptor, (err) => {
                                    if (!err) {
                                        callback(false);
                                    } else {
                                        callback("Error Closing File!");
                                    }
                                });
                            } else {
                                callback("Error Writing to Existing File!");
                            }
                        });
                    } else {
                        callback("Error Truncating File!");
                    }
                });
            } else {
                callback("Could Not Open the File, It might not exists yet!");
            }
        }
    );
};

// Delete a file
lib.delete = (dir, file, callback) => {
    // Unlink the file
    fs.unlink(lib.baseDir + dir + "/" + file + ".json", (err) => {
        if (!err) {
            callback(false);
        } else {
            callback("Error Deleting the File!");
        }
    });
};

// Export the module
module.exports = lib;
