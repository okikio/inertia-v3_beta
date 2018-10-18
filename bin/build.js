#!/usr/bin/env node

var exec = require('child_process').exec;
exec("packet", function (err) { if (err) { throw err; } });
exec("gulp", function (err) { if (err) { throw err; } });