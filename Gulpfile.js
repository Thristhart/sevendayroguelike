var gulp = require('gulp');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

var paths = {
  index: "./main.js",
  html: "./index.html",
  stylesheet: "./style.css",
  images: "./images/*.png",

  deploy: "/srv/http/tom.shea.at/7drl/"
};

function onError(err) {
  console.error(err.toString());
  this.emit('end');
}

gulp.task('browserify', function() {
  var browserifyTransform = transform(function(filename) {
    var b = browserify({entries: filename, debug:true});
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
