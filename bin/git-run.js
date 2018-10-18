#!/usr/bin/env node

var shell = require("shelljs");

var argv = Array.from(process.argv);
shell.exec("git add *");
shell.exec("git commit -m '" + (argv[0] || "Update") + '\'');
shell.exec("git push origin master");