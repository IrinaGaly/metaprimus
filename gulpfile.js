const { src, dest, task, series, watch } = require('gulp');
const rm = require('gulp-rm');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;
const sassGlob =require("gulp-sass-glob");
const autoprefixer = require("gulp-autoprefixer");
//const px2rem = require("gulp-smile-px2rem");
const gcmq = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const svgo = require('gulp-svgo');
const imageMin = require('gulp-image');
var gulpIf = require('gulp-if');
//const sourcemaps = require('gulp-sourcemaps');

const env = process.env.NODE_ENV;

const {DIST_PATH, SRC_PATH} = require("./gulp.config");

sass.compiler = require('node-sass');

task("clean", () => {
  return src( `${DIST_PATH}/**/*`, { read: false }).pipe(rm())
});

task("copy:html", () => {
  return src(`${SRC_PATH}/*.html`)
  .pipe(dest(DIST_PATH))
  .pipe(reload({ stream: true}));
});

const styles = [
  "node_modules/normalize.css/normalize.css",
  "node_modules/flickity/dist/flickity.min.css",
  "node_modules/bxslider/dist/jquery.bxslider.min.css",
  "src/styles/main.scss"
];

task("styles", () => {
  return src(styles)
    .pipe(concat("main.min.scss"))
    .pipe(sassGlob())
    .pipe(sass().on("error", sass.logError))
    //.pipe(px2rem())
    .pipe(
      autoprefixer({
        cascade: false
      })
    )
    .pipe(gcmq())
    .pipe(cleanCSS())
    .pipe(dest("dist"))
    .pipe(reload({ stream: true }));
});

const libs = [
  "node_modules/jquery/dist/jquery.js",
  "node_modules/bxslider/dist/jquery.bxslider.min.js",
  "node_modules/flickity/dist/flickity.pkgd.min.js",
  "src/scripts/*.js"
]

task("scripts", () => {
  return src(libs)
    .pipe(concat("main.min.js"))
    .pipe(
      babel({
        presets: ['@babel/env']
      })
    )
    .pipe(uglify())
    .pipe(dest("dist"))
    .pipe(reload({ stream: true }));
});

task("icons", () => {
  return src("src/images/icons/*.svg", "src/images/icons/*.png")
  .pipe(dest('dist/images/icons'))
});

task("images", () => {
  return src("src/images/*/*.png", "src/images/*/*/*.png")
   .pipe(
    imageMin({
    optipng: true,
     })
   )
  .pipe(reload({ stream: true }))
  .pipe(dest("dist/images"))
});

task("server", () => {
  browserSync.init({
    server: {
      baseDir: "./dist"
    },
    open: false
  })
});

watch("./src/styles/**/*.scss", series("styles"));
watch("./src/*.html", series("copy:html"));
watch("./src/*.js", series("scripts"));
watch("./src/images/icons/*.svg", series("icons"));
watch("./src/images/*/*.png", series("images"));

task("default", series( "copy:html", "styles", "scripts",  "server"))