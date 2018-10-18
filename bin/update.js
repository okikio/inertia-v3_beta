#!/usr/bin/env node

var exec = require('child_process').exec;
exec("npm link", function (err) { if (err) { throw err; } });