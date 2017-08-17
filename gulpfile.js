var gulp = require('gulp');
var git = require('gulp-git');
var replace = require("gulp-replace");
var rename = require("gulp-rename");
var packageJson = require('./package.json');

var commitish;

gulp.task('version', ['git-version'], function () {
  return gulp.src('version.json.template')
    .pipe(rename("version.json"))
    .pipe(replace("<COMMITISH>", commitish))
    .pipe(replace("<VERSION>", packageJson.version))
    .pipe(gulp.dest('app/version/'));
});

gulp.task('git-version', function() {
  return new Promise(function(resolve, reject) {
    git.revParse({ args: '--short HEAD' }, function (err, _commitish) {
      if (err) {
        return reject(err);
      }
      commitish = _commitish;
      console.log('Current git hash: ' + commitish);
      resolve(commitish);
    });
  });
});

gulp.task('default', ['git-version', 'version']);
