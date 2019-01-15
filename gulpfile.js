// ############## Vars

var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins = gulpLoadPlugins({camelize: true});

var runSequence = require('run-sequence');
var browserSync = require('browser-sync');

var env = process.env.APP_ENVIRONMENT;

// ############## Configuration

var webDir = './',
    nodeDir = './node_modules/',
    jsFiles = [
      nodeDir + 'vanilla-tilt/dist/vanilla-tilt.babel.js',
      webDir + 'src/js/app.js'
    ],
    cssFiles = webDir + 'src/scss/**/*.scss',
    svgFiles = [
      webDir + 'src/svg/**/*.svg',
      '!' + webDir + 'src/svg/__optimize/**/*.svg'
    ];

// ############## Sass : traitement des fichiers de style

gulp.task('sass', function() {
  gulp
    .src(webDir + 'src/scss/app.scss')
    .pipe(plugins.sourcemaps.init())
    .pipe(
      plugins.sass({
        includePaths: [nodeDir, webDir]
      }).on('error', plugins.sass.logError)
    ) // Compile SCSS > CSS
    .pipe(plugins.autoprefixer({ browsers: ['last 99 versions', 'IE 11'] })) // Préfix for old browsers
    .pipe(plugins.cleanCss()) // Minify CSS
    .pipe(plugins.rename({
      basename: 'app',
      suffix: '.min'
    })) // Add suffix .min
    .pipe(plugins.sourcemaps.write('maps/'))
    .pipe(gulp.dest(webDir + 'dist/')) // Save app.min.css in dist directory
    .pipe(browserSync.stream());
});

// ############## JS : traitement des scripts

gulp.task('js', function() {
  gulp
    .src(jsFiles)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.uglyfly()) // Minify JS
    .pipe(plugins.concat('app.min.js')) // Add suffix .min
    .pipe(plugins.sourcemaps.write('maps/'))
    .pipe(gulp.dest(webDir + 'dist/')); // Save app.min.js in dist directory
});

gulp.task('js-watch', ['js'], function (done) {
  browserSync.reload();
  done();
});

// ############## Gestion SVG -> Création de symbols -> Injection dans le HTML

gulp.task('svg-optimize', function() {
  return gulp.src(svgFiles)
    .pipe(plugins.svgmin({
      plugins: [{
        removeViewBox: false,
      }]
    }))
    .pipe(gulp.dest(webDir + 'src/svg/__optimize/'));
});

gulp.task('svg-icons', function () {
  return gulp.src(webDir + 'src/svg/__optimize/**/*.svg')
    .pipe(plugins.svgSprites({
      mode: "symbols",
      selector: "i-%f",
    }))
    .pipe(gulp.dest(webDir + "assets/icons/"));
});

gulp.task('svg-inject', function () {
  return gulp.src(webDir + 'index.html')
    .pipe(plugins.injectSvg())
    .pipe(gulp.dest(webDir));
});

gulp.task('svg', function () {
  runSequence('svg-optimize', 'svg-icons', 'svg-inject');
});

// ############## BrowserSync

gulp.task('browsersync', ['sass', 'js-watch', 'svg'], function () {
  browserSync.init({
    proxy: "front:8080",
    notify: true,
    ghostMode: false,
    open: false
  });

  gulp.watch(cssFiles, ['sass']);
  gulp.watch(jsFiles, ['js-watch']);
});

// ############## Watch

gulp.task('watch', function() {
  gulp.watch(jsFiles, ['js']);
  gulp.watch(cssFiles, ['sass']);
  gulp.watch(svgFiles, ['svg']);
});

// ############## Compile

gulp.task('compile', function(){
  runSequence('svg', 'sass', 'js');
});

// ############## Default

gulp.task('default', function() {
  runSequence('compile', 'watch');
});
