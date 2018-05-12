var gulp = require('gulp')
var clean = require('gulp-clean')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')
var sourcemaps = require('gulp-sourcemaps')
var browserify = require('browserify')
var fs = require('fs')

function standalone(name, entry, exportName) {
  return browserify(entry, { debug: true, standalone: exportName || name })
    .bundle()
    .pipe(fs.createWriteStream('./dist/'+ name.replace(/_/g, '-') +'.js'))
}

gulp.task('bundle:zaitun-effect:effectManager', function() {
  return standalone('effectManager', './effectManager.js')
})

gulp.task('bundle:zaitun-effect:index', function() {
  return standalone('index', './index.js')
})

gulp.task('bundle', [
  'bundle:zaitun-effect:effectManager',  
  'bundle:zaitun-effect:index',  
])

gulp.task('compress', ['bundle'], function() {
  return gulp.src(['dist/*.js', '!dist/*.min.js'])
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename({ suffix: '.min', basename:'zaitun' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
})

gulp.task('clean', function() {
  return gulp.src('dist/*.*', {read: false})
    .pipe(clean())
})

gulp.task('default', ['bundle'])
