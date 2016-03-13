// Copyright (c) Rotorz Limited. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root.

"use strict";


const babel = require("gulp-babel");
const gulp = require("gulp");
const merge = require('merge2');
const sourcemaps = require("gulp-sourcemaps");
const ts = require("gulp-typescript");

const tsProject = ts.createProject("tsconfig.json");


gulp.task("build", function() {
  let failed = false;

  let tsResult = gulp.src([ "src/**/*.ts", "typings/**/*.ts" ])
    .pipe(sourcemaps.init())
    .pipe(ts(tsProject));

  let finalResult = merge([
    tsResult.dts
      .pipe(gulp.dest('lib')),

    tsResult.js
      .pipe(babel())
      .pipe(sourcemaps.write("."))
      .pipe(gulp.dest("lib"))
  ]);

  return finalResult
    .on("error", function () { failed = true; })
    .on("finish", function () { failed && process.exit(1); });
});
