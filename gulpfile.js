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

gulp.task('bundle:zaitun:bootstrap', function() {
  return standalone('bootstrap', './bootstrap.js')
})

gulp.task('bundle:zaitun:componentManager', function() {
  return standalone('componentManager', './componentManager.js')
})

gulp.task('bundle:zaitun:effect', function() {
  return standalone('effect', './effect.js')
})

gulp.task('bundle:zaitun:router', function() {
  return standalone('router', './router.js')
})

gulp.task('bundle:zaitun:index', function() {
  return standalone('index', './index.js')
})

gulp.task('bundle:devTool:devTool', function() {
  return standalone('devTool', './devTool/devTool.js')
})

gulp.task('bundle:dom:hyperscript-helpers', function() {
  return standalone('hyperscript-helpers', './dom/hyperscript-helpers.js')
})

gulp.task('bundle:dom:modules', function() {
  return standalone('modules', './dom/modules.js')
})

gulp.task('bundle:dom:index', function() {
  return standalone('hyperscript-helpers', './dom/index.js')
})

gulp.task('bundle', [
  'bundle:zaitun:bootstrap',
  'bundle:zaitun:componentManager',
  'bundle:zaitun:effect',
  'bundle:zaitun:router',
  'bundle:zaitun:index',
  'bundle:devTool:devTool',
  'bundle:dom:hyperscript-helpers',
  'bundle:dom:modules',
  'bundle:dom:index' 
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
