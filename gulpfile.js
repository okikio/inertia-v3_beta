var fs = require('fs');
var gulp = require('gulp');
var concat = require('gulp-concat');
var _ = require("underscore");
var required = require("./required");
var scripts = _.map(required, function(val) {
    console.log("src/" + val.toLowerCase() + ".js")
    return "src/" + val.toLowerCase() + ".js";
});

gulp.task('default', function() {
    return gulp.src(scripts)
        .pipe(concat('inertia.js'))
        .pipe(gulp.dest('.'));
});
