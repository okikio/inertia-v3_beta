var gulp = require('gulp');
var concat = require('gulp-concat');
var _ = require("underscore");
var modules = require("./module-sort");
var scripts = _.map(modules, function (val) {
    return "modules/" + val.toLowerCase() + ".js";
});

gulp.task('default', function() {
  return gulp.src(scripts)
    .pipe(concat('inertia.js'))
    .pipe(gulp.dest(''));
});