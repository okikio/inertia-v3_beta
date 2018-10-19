#!/usr/bin/env node

var fs = require("fs");
var path = require('path');

// Compile all components for runnable modules
let compile = function(from, to, ref) {
    let required, content, file, root = path.normalize(__dirname + '/../');

    // Read all the files from the 'from' directory
    fs.readdir(from, function(err, filenames) {
        if (err) { throw err; }

        // Iterate per file
        filenames.forEach(function(dir) {
            var __dir;
            if (fs.existsSync(root + from + dir + "/required.js")) {
                __dir = root + from + dir + "/required.js";
            } else { __dir = root + "required.js"; }
            
            required = require(__dir);
            content = required.reduce(function(acc, val) {
                // Read & Write
                file = (root + ref + val.toLowerCase() + ".js");
                acc.push( fs.readFileSync(file, 'utf-8') );
                return acc;
            }, []);
            
            // Write the contents to of each component to it's compiled counter-part 
            fs.writeFile(root + to + dir + '.js', content.join("\n"), function(err) {
                if (err) { throw err; }
            });
            console.log(to + dir  + '.js - Write operation complete.'); 
        });
    });
};

// Folders
compile('modules/', 'compile/', 'src/');
