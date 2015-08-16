// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var concat = require('gulp-concat'),
    svgmin = require('gulp-svgmin'),
    svgstore = require('gulp-svgstore'),
    minifyCSS = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    spritesmith = require('gulp.spritesmith'),
    less = require('gulp-less'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    livereload = require('gulp-livereload'),
    cheerio = require('gulp-cheerio');


//////////////////////////////////////////////

// WATCH AREA

// compile less -> .css -> min.css
gulp.task('less', function () {

    gulp.src('assets/_less/styles.less')
        .pipe(less())
        .on('error', function(err){ console.log(err.message); })
        .pipe(minifyCSS({
            keepSpecialComments: 0
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('assets/css/'));

});

// compile bootstrap less -> .css -> min.css
gulp.task('less-bootstrap', function () {

    gulp.src('assets/bootstrap/bootstrap.less')
        .pipe(less())
        .on('error', function(err){ console.log(err.message); })
        .pipe(minifyCSS({
            keepSpecialComments: 0
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('assets/bootstrap/'));

});

// Compile _js -> _js.min
gulp.task('_js.min', function() {
    gulp.src('assets/_js/*.js')
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('assets/_js.min/'));
});

// Create sprite from assets/img/sprite/*.png, write less, create sprite.png
gulp.task('sprite', function () {
    var spriteData = gulp.src('assets/img/sprite/*.png').pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: 'sprite.less',
        cssTemplate: 'less.template.svk.custom.mustache',
        cssVarMap: function(sprite) {
            sprite.name = 's-' + sprite.name
        }
    }));

    //spriteData.img
    //    .pipe(imagemin({
    //        progressive: true,
    //        use: [pngquant()]
    //}));

    spriteData.img.pipe(gulp.dest('assets/img')); // путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest('assets/_less')); // путь, куда сохраняем стили
});

// {include file="svg-all.svg"}
// <i class="icon i-header-logo"><svg><use xlink:href="#icon-header-logo" /></svg></i>
gulp.task('svgstore', function () {
    return gulp
        .src('assets/img/svg/*.svg')
        .pipe(svgmin())
        .pipe(rename({prefix: 'icon-'}))
        .pipe(cheerio({
            run: function ($, file) {
                $('[fill="none"]').removeAttr('fill');

                var filePathStr = file.history[1];
                //example result:  c:\\WebServers\\home\\template-project-2\\www\\assets\\img\\svg\\icon-crown-by-ps-fill.svg

                var regexFileName = /(icon-.*?\.svg)/g;
                // icon-crown-by-ps-fill.svg

                var fileNameArray = filePathStr.match(regexFileName);
                // type array ['icon-crown-by-ps-fill.svg']

                var fileName = fileNameArray[fileNameArray.length-1];
                // type string: icon-crown-by-ps-fill.svg

                fileName = fileName.replace('.svg', '');
                // type string: icon-crown-by-ps-fill

                // replace in all file html
                var fileHtml = $('svg').html();

                var regClassAttr = /class="cls/g;
                var replClassAttr = 'class="' + fileName;
                fileHtml = fileHtml.replace(regClassAttr, replClassAttr);


                var regClassSelector = /.cls/g;
                var replClassSelector = '.' + fileName;
                fileHtml = fileHtml.replace(regClassSelector, replClassSelector);


                $('svg').html(fileHtml);

                $('style').each(function () {
                    var style = $(this),
                        pre = '{literal}',
                        after = '{/literal}';

                    style.text(pre + style.text() + after);
                });
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(svgstore())
        .pipe(rename('svg-all.svg'))
        .pipe(gulp.dest('assets/img/'));
});

// Watch for changes, and live reload
gulp.task('watch', function () {

    livereload.listen();

    // Watch .js files and run tasks if they change
    //gulp.watch('assets/_js/*.js', ['_js.min']).on('change', livereload.changed);

    // Watch .less files and run tasks if they change
    gulp.watch('assets/_less/*.less', ['less']).on('change', livereload.changed);

    //gulp.watch('assets/bootstrap3.3.4/less/*.less', ['less-bootstrap']).on('change', livereload.changed);

    // Watch sprite images in folder and run tasks if they change
    //gulp.watch('assets/img/sprite/*.png', ['sprite']).on('change', livereload.changed);

    // Watch svg images in folder and run tasks if they change
    //gulp.watch('assets/img/svg/*.svg', ['svgstore']).on('change', livereload.changed);
});

//////////////////////////////////////////////


// Concatenate & Minify JS, CSS PLUGINS
gulp.task('plugins', function() {
    // concat minify plugins JS
    gulp.src(pluginsJS)
        .pipe(concat('_plugins-all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('assets/_plugins/'));

    // concat minify plugins CSS
    gulp.src(pluginsCSS)
        .pipe(concat('_plugins-styles.min.css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('assets/_plugins/'));

});

// Optimization Image
gulp.task('image-min', function () {
    return gulp.src('assets/img/official/*')
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest('assets/img/official'));
});

// RUN console: gulp
gulp.task('default', ['watch']);