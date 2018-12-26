'use strict';

const gulp = require('gulp');
const clean = require('gulp-clean');
const ts = require('gulp-typescript');
const { join } = require('path');

const tsProject = ts.createProject('./tsconfig.json');

const PATH_DIST = join(__dirname, 'dist');

gulp.task('scripts', () => {
    const tsResult = tsProject.src()
        .pipe(tsProject());

    return tsResult.js
        .pipe(gulp.dest(PATH_DIST));
});

gulp.task('static', () => {
    return gulp
        .src(['src/**/*.json'])
        .pipe(gulp.dest(PATH_DIST));
});

gulp.task('clean', () => {
    return gulp
        .src(PATH_DIST)
        .pipe(clean());
});

gulp.task('build', gulp.series('clean', 'static', 'scripts'));

gulp.task('watch', gulp.series('build', () => {
    return gulp.watch(
        ['src/**/*.ts', 'src/**/*.json'],
        gulp.series('build')
    );
}));

gulp.task('default', gulp.series('watch'));