// Load plugins
var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    bower = require('gulp-bower'),
    include = require('gulp-include'),
    gulpFilter = require('gulp-filter'),
    plumber = require('gulp-plumber'),
    react = require('gulp-react'),
    flatten = require('gulp-flatten'),
    connect = require('gulp-connect'),
    lr = require('tiny-lr'),
    server = lr();
 
// Styles
gulp.task('styles', function() {
  return gulp.src('src/styles/main.scss')
    .pipe(sass({ style: 'expanded', }))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('dist/styles'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    // .pipe(livereload(server))
    .pipe(gulp.dest('dist/styles'))
    .pipe(notify({ message: 'Styles task complete' }));
});
 
// Scripts
gulp.task('scripts', function() {
  return gulp.src('src/scripts/**/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(rename({ suffix: '.min' }))
    // .pipe(uglify())
    // .pipe(livereload(server))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

// React
gulp.task('react', function() {
  return gulp.src('/src/jsx/**/*.jsx')
    .pipe(react())
    .on('error', function(e) {
      console.error(e.message + '\n  in ' + e.fileName)
    })
    .pipe(concat('components.js'))
    .pipe(gulp.dest('dist/scripts/'))
    .pipe(notify({ message: 'React task complete' }));
})
 
// Images
gulp.task('images', function() {
  return gulp.src('src/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    // .pipe(livereload(server))
    .pipe(gulp.dest('dist/images'))
    .pipe(notify({ message: 'Images task complete' }));
});
 
// Clean
gulp.task('clean', function() {
  return gulp.src(['dist/styles', 'dist/scripts', 'dist/images'], {read: false})
    .pipe(clean());
});
 
// Default task
gulp.task('default', ['clean'], function() {
    gulp.run('styles', 'scripts', 'images', 'react');
});

// Simple server
gulp.task('connect', function() {
  connect.server();
});
 
// Watch
gulp.task('watch', function() {
 
  // Listen on port 35729
  // server.listen(35729, function (err) {
  //   if (err) {
  //     return console.log(err)
  //   };
 
    // Watch .scss files
    gulp.watch('src/styles/**/*.scss', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
      gulp.run('styles');
    });

    // Watch .jsx files
    gulp.watch('src/scripts/**/*.jsx', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
      gulp.run('react');
    });
 
    // Watch .js files
    gulp.watch('src/scripts/**/*.js', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
      gulp.run('scripts');
    });
 
    // Watch image files
    gulp.watch('src/images/**/*', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
      gulp.run('images');
    });
 
  // });
 
});