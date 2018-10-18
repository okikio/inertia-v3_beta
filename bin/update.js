#!/usr/bin/env node

var exec = require('child_process').exec;
exec("npm unlink && npm link", function (err) { if (err) { throw err; } });