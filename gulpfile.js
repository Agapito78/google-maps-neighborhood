/**
 * Created by agapi on 6/1/2017.
 */
var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');

var config = {
    bowerDir: 'bower_components'
}

gulp.task('bootstrap-fonts', function() {
    return gulp.src(config.bowerDir + "/bootstrap/dist/fonts")
        .pipe(gulp.dest("public/fonts"));
});

gulp.task('bootstrap-css', function() {
    return gulp.src(config.bowerDir + "/bootstrap/dist/css/*")
        .pipe(gulp.dest("public/css"));
});

gulp.task('animate-css', function() {
    return gulp.src([config.bowerDir + "/animate.css",config.bowerDir + "/animate.min.css"])
        .pipe(gulp.dest("public/css"));
});


gulp.task('js-minify', function() {
    return gulp.src("views/js/main.js")
        .pipe(rename('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest("views/js"));
});

gulp.task('css-minify', function() {
    return gulp.src("public/css/style.css")
        .pipe(cleanCSS({debug: true}, function(details) {
            console.log(details.name + ': ' + details.stats.originalSize);
            console.log(details.name + ': ' + details.stats.minifiedSize);
        }))
        .pipe(concat('public/style.min.css'))
        .pipe(gulp.dest('css'));
});

gulp.task('js-minify', function() {
    return gulp.src("public/js/main.js")
        .pipe(rename('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest("public/js"));
});

var gulpTasksDev = [
    "bootstrap-fonts",
    "bootstrap-css",
    "animate-css"
];

gulp.task('dev', gulpTasksDev);

gulp.task('default', ['css-minify', 'js-minify']);
