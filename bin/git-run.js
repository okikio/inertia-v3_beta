#!/usr/bin/env node

var exec = require('child_process').exec;
var argv = Array.from(process.argv);
exec("git add -A .", function (err) { if (err) { throw err; } });
exec("git commit -a -m '" + (argv[1] || "Update") + '\'', function (err) { if (err) { throw err; } });
exec("git push origin master", function (err) { if (err) { throw err; } });