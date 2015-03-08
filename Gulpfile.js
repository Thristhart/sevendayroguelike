var gulp = require('gulp');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var path = require('path');

var paths = {
  index: "./main.js",
  lib: "./lib/*.js",
  html: "./index.html",
  stylesheet: "./style.css",
  images: "./images/*.png",
  build: "./build/",
  externalSources: [
    "./node_modules/matter-js/build/matter.js",
    "./node_modules/pixi.js/bin/pixi.js"
  ],

  deploy: "/srv/http/tom.shea.at/7drl/"
};

function onError(err) {
  console.error(err.toString());
  this.emit('end');
}

gulp.task('browserify-external', function() {
  var fs = require('fs');
  if(fs.existsSync(paths.build + "external.js"))
    return;
  var browserifyTransform = transform(function(filename) {
    var b = browserify({
      entries: filename,
      noParse: [filename],
      detectGlobals: false
    });
    b.require(filename, {expose: path.basename(filename)});
    return b.bundle();
  });
  return gulp.src(paths.externalSources)
    .pipe(browserifyTransform)
    .on('error', onError)
    .pipe(uglify())
    .pipe(concat('external.js'))
    .pipe(gulp.dest(paths.build))
});
gulp.task('browserify', ["browserify-external"], function() {
  var browserifyTransform = transform(function(filename) {
    var b = browserify({
      entries: filename,
      debug:true,
      detectGlobals: false,
      bundleExternal: false
    });
    b.external('pixi.js');
    b.external('matter.js');
    return b.bundle();
  });

  return gulp.src(paths.index)
    .pipe(browserifyTransform)
    .on('error', onError)
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./build'));
});

gulp.task('watch', function() {
  gulp.watch([paths.index, paths.lib], ['deploy-js']);
  gulp.watch([paths.html, paths.stylesheet, paths.images], ['deploy-static']);
});

gulp.task('deploy-js', ['browserify'], function() {
  gulp.src('./build/*')
    .pipe(concat('main.js'))
    .pipe(gulp.dest(paths.deploy));
});

gulp.task('deploy-static', function() {
  gulp.src([paths.html])
    .pipe(gulp.dest(paths.deploy));
  gulp.src([paths.images])
    .pipe(gulp.dest(paths.deploy + "images"));
  gulp.src([paths.stylesheet])
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.deploy));
});

gulp.task('deploy', ['deploy-js', 'deploy-static']);

gulp.task('default', ['browserify']);
