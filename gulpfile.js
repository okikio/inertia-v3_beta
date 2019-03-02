var fs = require('fs');
var gulp = require('gulp');
var concat = require('gulp-concat');
var _ = require("underscore");

var getting_started_required = require("./getting-started/required");
var getting_started_scripts = _.map(getting_started_required, function(val) {
    return "src/" + val.toLowerCase() + ".js";
});

var required = require("./required");
var scripts = _.map(required, function(val) {
    console.log("src/" + val.toLowerCase() + ".js")
    return "src/" + val.toLowerCase() + ".js";
});

function start () {
    return gulp.src(getting_started_scripts.concat("getting-started/getting-started.js"))
        .pipe(concat('inertia.js'))
        .pipe(gulp.dest('./getting-started'))
} 
gulp.task("start", start);
gulp.task('default', function() {
    return gulp.src(scripts)
        .pipe(concat('inertia.js'))
        .pipe(gulp.dest('.')), 
        start();
});
