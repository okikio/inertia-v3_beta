#!/usr/bin/env node

var shell = require("shelljs");
shell.exec("gulp");
shell.exec("packet");
shell.exec("compile");