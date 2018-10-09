import * as gulp from 'gulp';
import {CLIOptions, build as buildCLI} from 'aurelia-cli';
import transpile from './transpile';
import processMarkup from './process-markup';
import processCSS from './process-css';
import copyFiles from './copy-files';
import watch from './watch';
import * as project from '../aurelia.json';

gulp.task('generate-service-worker', function (callback) {
  let env = CLIOptions.getEnvironment();
  var path = require('path');
  var swPrecache = require('sw-precache');
  var rootDir = project.platform.output;
  var baseUrl = project.baseUrl[env] || project.baseUrl['default'] || "/";

  swPrecache.write(path.join('sw.js'), {
    maximumFileSizeToCacheInBytes: 5097152,
    staticFileGlobs: [
      'index.html',
      rootDir + '/**/*.{js,html,css}',
      'static/**/*.{png,jpg,gif}'
    ],
    replacePrefix: baseUrl,
  }, callback);
});

gulp.task('touch-up-index', function(callback) {
  let replace = require('gulp-replace');
  let env = CLIOptions.getEnvironment();
  let baseUrl = project.baseUrl[env] || project.baseUrl['default'] || "/";
  let rootDir = project.platform.output;
  let swPrecacheRegister = `<!-- sw-precache -->
    <script>
      if ('serviceWorker' in navigator && ${env != "dev"}) {
        navigator.serviceWorker.register('${baseUrl}sw.js').then(function() {
        });
      }
    </script>
    <!-- end-sw-precache -->`;

  return gulp.src('./index.html', {base: './'})
    .pipe(replace(/<!-- sw-precache[\s\S]*end-sw-precache -->/, swPrecacheRegister))
    .pipe(gulp.dest("./"));
});

gulp.task('touch-up-run-docker', function(callback) {
  let replace = require('gulp-replace');
  let env = CLIOptions.getEnvironment();
  let baseUrl = project.baseUrl[env] || project.baseUrl['default'] || "/";
  baseUrl = baseUrl.substr(1)
  let offlinestatus = env != "dev" ? "(offline enabled)" : "";

  return gulp.src('./run-docker.sh', {base: './'})
    .pipe(replace(/baseurl=.*/, "baseurl='"  + baseUrl + "'"))
    .pipe(replace(/offlinestatus=.*/, "offlinestatus='"  + offlinestatus + "'"))
    .pipe(gulp.dest("./"));
});

let build = gulp.series(
  readProjectConfiguration,
  gulp.parallel(
    transpile,
    processMarkup,
    processCSS,
    copyFiles
  ),
  writeBundles,
  'generate-service-worker',
  'touch-up-index',
  'touch-up-run-docker',
);

let main;

if (CLIOptions.taskName() === 'build' && CLIOptions.hasFlag('watch')) {
  main = gulp.series(
    build,
    (done) => { watch(); done(); }
  );
} else {
  main = build;
}

function readProjectConfiguration() {
  return buildCLI.src(project);
}

function writeBundles() {
  return buildCLI.dest();
}

export { main as default };
