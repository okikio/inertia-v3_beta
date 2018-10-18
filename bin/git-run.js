#!/usr/bin/env node

var exec = require('child_process').exec;
var argv = Array.from(process.argv);
exec("git add *", function (err) { if (err) { throw err; } });
exec("git commit -m '" + (argv[0] || "Update") + '\'', function (err) { if (err) { throw err; } });
exec("git push origin master", function (err) { if (err) { throw err; } });