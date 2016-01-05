'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var bsync = require('browser-sync');
var browserify = require('browserify');
var watchify = require('watchify');
var path = require('path');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var notify = require('gulp-notify');
var prettyHrtime = require('pretty-hrtime');
var startTime;

var handleError = function(e) {
    var args = Array.prototype.slice.call(arguments);

    //Send error to notification center with gulp-notify
    notify.onError({
        title:   'Compile Error',
        message: '<%= error.message %>'
    }).apply(this, args);

    gutil.log(e);

    // Keep gulp from hanging on this task
    this.emit('end');
};

var bundleLogger = {
    start: function() {
        startTime = process.hrtime();
        gutil.log('Running', gutil.colors.green('bundle') + '...');
    },

    end: function() {
        var taskTime = process.hrtime(startTime);
        var prettyTime = prettyHrtime(taskTime);
        gutil.log('Finished', gutil.colors.green('bundle'), 'in', gutil.colors.magenta(prettyTime));
    }
};

gulp.task('js', function() {
    var bundler = browserify({
        entries: ['./app.js'],
        debug:   true       // Enable source maps!
        //fullPaths   : true,
        //paths :['./node_modules','./app/scripts/']
    });

    // Transforms
    bundler.transform('jstify', {
        engine:       'lodash',
        templateOpts: {
            variable: 'data'
        }
    });

    var bundle = function() {
        if (global.isWatching) {
            bundleLogger.start();
        }

        return bundler
            .bundle()
            .on('error', handleError)
            .pipe(source('script.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: '.'}))
            .pipe(gulp.dest('.'))
            .on('end', function() {
                if (global.isWatching) {
                    bundleLogger.end();
                }

                bsync.reload();
            });
    };

    if (global.isWatching) {
        bundler = watchify(bundler, {poll: true});
        bundler.on('update', bundle); // Rebundle with watchify on changes.
    }

    return bundle();
});

gulp.task('setWatch', function() {
    global.isWatching = true;
});

gulp.task('default', ['setWatch', 'js'], function() {
    bsync({
        server: {
            baseDir:    '.',

        },
        port:   3000,
        open:   false,
        ghostMode: false
    });

    //gulp.watch('script.js', bsync.reload);
});
