#!/usr/bin/env node

var fs = require('fs');
var mkdirp = require('mkdirp');

// Create little packet folders based on a list of js from another folder
let packeteer = function(from, to, fn) {
    // Read all the files from the 'from' directory
    fs.readdir(from, function(err, filenames) {
        if (err) { throw err; }

        // Iterate per file
        filenames.forEach(function(filename) {
            var dir = filename.replace(".js", ""); // Remove '.js'
            if (!fn) {
                // Make new packet directory
                mkdirp(to + dir, function(err, content) {
                    if (err) { throw err; }

                    // Read each js file
                    fs.readFile(from + filename, 'utf-8', function(err, content) {
                        if (err) { throw err; }

                        // Write the contents to the index.js of packet folders
                        fs.writeFile(to + dir + '/index.js', content, function(err) {
                            if (err) { throw err; }
                            else { console.log(to + dir + '/index.js - Write operation complete.'); }
                        });
                    });
                });
            } else { fn(dir); }
        });
    });
};

// Create a copy of api docs from api folders and place the little packets into modules folder
let packeteerApi = function(from, to) {
    // Read all the files from the 'from' directory
    fs.readdir(from, function(err, filenames) {
        if (err) { throw err; }

        // Iterate per file
        filenames.forEach(function(filename) {
            var dir = filename.replace(".md", ""); // Remove '.md'
            // Make new packet directory
            mkdirp(to + dir, function(err, content) {
                if (err) { throw err; }

                // Read each md file
                fs.readFile(from + filename, 'utf-8', function(err, content) {
                    let val;
                    if (err) { throw err; }
                    
                    // Write the contents to the api.md of packet folders
                    fs.writeFile(to + dir + '/api.md', content, function(err) {
                        if (err) { throw err; }
                        else { console.log(to + dir + '/api.md - Write operation complete.'); }
                    });
                });
    
                // Read main required js, create a copy in packet folder
                fs.readFile("required.js", 'utf-8', function(err, content) {
                    if (err) { throw err; return; }
                
                    // Write the contents to the required js of packet folders
                    fs.writeFile(to + dir + '/required.js', content, function(err) {
                        if (err) { throw err; return; }
                        else { console.log(to + dir + '/required.js - Write operation complete.'); }
                    });
                });
            });
        });
    });
};

// Create little packets for modules folder
packeteer('src/', 'modules/');

// Create little packets for api folder, but instead of index.js the `filename` and md
packeteer('src/', 'api/', function(filename) {
    fs.appendFile('api/' + filename + '.md', "", function(err) {
        if (err) { throw err; }
        else { console.log('api/' + filename + '.md - Write operation complete.'); }
    });
});

// Create a copy of api docs from api folders and place the little packets into modules folder
packeteerApi('api/', 'modules/');
