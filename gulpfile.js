'use strict';

const { watch, src, dest, parallel, series } = require('gulp');
const browserSync = require('browser-sync');
const del = require('del');
const plumber = require('gulp-plumber');
const twig = require('gulp-twig');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const imagemin = require('gulp-imagemin');
const typograf = require('gulp-typograf');
const htmlbeautify = require('gulp-html-beautify');
const ghPages = require("gulp-gh-pages");
const webp = require("gulp-webp");

function errorHandler(errors) {
    console.warn('Error!');
    console.warn(errors);
}

function devServer(cb) {
    var params = {
      watch: true,
      reloadDebounce: 150,
      notify: false,
      server: { baseDir: './build' },
    };
  
    browserSync.create().init(params);
    cb();
  }

function buildPages() {
  return src('source/index.twig')
    .pipe(plumber({ errorHandler }))
    .pipe(twig())
    .pipe(typograf({locale: ['ru', 'en-US']}))
    .pipe(htmlbeautify())
    .pipe(dest('build/'));
}

function buildStyles() {
  return src('source/scss/style.scss')
  .pipe(plumber({ errorHandler }))
  .pipe(sass())  
  .pipe(postcss([
      autoprefixer({grid: "autoplace"}),
      cssnano()
  ]))
  .pipe(dest('build/styles/'));
}


function buildAssets(done) {
    src(['source/assets/**/*.*', '!source/assets/images/**/*.*'])
    .pipe(dest('build/assets/'));

    src('source/assets/images/**/*.*')
    .pipe(imagemin())
    .pipe(dest('build/assets/images'));

    done()
}

function watchFiles() {
    watch('source/**/*.twig', buildPages);
    watch(['source/scss/**/*.scss', 'source/scss/**/*.css'], buildStyles);
    watch('source/assets/**/*.*', buildAssets);
}

function clearBuild() {
    return del('build/');
}

function deploy() {
    return src("./build/**/*")
    .pipe(ghPages());
}
  
exports.deploy = deploy;
  
exports.default =  
    series(
        clearBuild,
        parallel(
            devServer,
            series(
                parallel(buildPages, buildStyles, buildAssets),
                watchFiles
            )
        )
    )








// const gulp = require('gulp');
// const rename = require('gulp-rename');
// const sass = require('gulp-sass');
// const autoprefixer = require('gulp-sass');
// const sourcemaps = require('gulp-sourcemaps');
// const browserSync = require('browser-sync').create();

// function sassCompile(done) {

//     gulp.src('./#source/scss/style.scss')
//     .pipe(sourcemaps.init())
//     .pipe(sass({
//         errorLogConsole: true,
//         outputStyle: 'compressed'
//     }))
//     .on('error', console.error.bind(console))
//     .pipe(autoprefixer({
//         browsers: ('last 2 versions'),
//         cascade: false
//     }))
//     .pipe(rename({suffix: '.min'}))
//     .pipe(sourcemaps.write('./'))
//     .pipe(gulp.dest('./css'))
//     .pipe(browserSync.stream());

//     done()
// }

// function watchFiles() {
//     gulp.watch("./#source/scss/**/*", sassCompile);
//     gulp.watch("./**/*.html", browserReload);
//     gulp.watch("./**/*.js", browserReload);
// }

// function sync(done) {
//     browserSync.init({
//         server: {
//             baseDir: "./"
//         },
//         port: 3000
//     })
//     done();
// }

// function browserReload(done) {
//     browserSync.reload();
//     done();
// }

// gulp.task('default', gulp.parallel(watchFiles, sync));