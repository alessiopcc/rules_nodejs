// Karma configuration
// GENERATED BY Bazel
const path = require('path');
const fs = require('fs');
const tmp = require('tmp');

// When karma is configured to use Chrome it will look for a CHROME_BIN
// environment variable. This line points Karma to use puppeteer instead.
// See
// https://github.com/karma-runner/karma-chrome-launcher/blob/master/README.md#headless-chromium-with-puppeteer
process.env.CHROME_BIN = require('puppeteer').executablePath();

let files = [
  TMPL_files
];

// On Windows, runfiles will not be in the runfiles folder but inteaad
// there is a MANIFEST file which maps the runfiles for the test
// to their location on disk. Bazel provides a TEST_SRCDIR environment
// variable which is set to the runfiles folder during test execution.
// If a MANIFEST file is found, we remap the test files to their
// location on disk using the MANIFEST file.
const manifestFile = path.join(process.env.TEST_SRCDIR || '', 'MANIFEST');
if (fs.existsSync(manifestFile)) {
  // MANIFEST file contains the one runfile mapping per line seperated
  // a space. For example:
  // rxjs/operators.js /private/var/tmp/.../external/rxjs/operators.js
  // The file is parsed here into a map of for easy lookup
  const manifest = {};
  for (l of fs.readFileSync(manifestFile, 'utf8').split('\n')) {
    const m = l.split(' ');
    manifest[m[0]] = m[1];
  }
  files = files.map(f => {
    const manifestFile = manifest[f];
    if (!manifestFile) {
      throw new Error(`File not found in MANIFEST: ${f}`);
    }
    return manifestFile;
  });
}

var requireConfigContent = `
// A simplified version of Karma's requirejs.config.tpl.js for use with Karma under Bazel.
// This does an explicit \`require\` on each script in the files, otherwise nothing will be loaded.
(function(){
  var allFiles = ${JSON.stringify([TMPL_files])};
  var allTestFiles = [];
  allFiles.forEach(function (file) {
    if (/(spec|test)\\.js$/i.test(file)) {
      allTestFiles.push(file.replace(/\\.js$/, ''))
    }
  });
  require(allTestFiles, window.__karma__.start);
})();
`;

const requireConfigFile = tmp.fileSync(
    {keep: false, postfix: '.js', dir: process.env['TEST_TMPDIR']});
fs.writeFileSync(requireConfigFile.name, requireConfigContent);
files.push(requireConfigFile.name);

module.exports = function(config) {
  if (process.env['IBAZEL_NOTIFY_CHANGES'] === 'y') {
    // Tell karma to only listen for ibazel messages on stdin rather than watch all the input files
    // This is from fork alexeagle/karma in the ibazel branch:
    // https://github.com/alexeagle/karma/blob/576d262af50b10e63485b86aee99c5358958c4dd/lib/server.js#L172
    config.set({watchMode: 'ibazel'});
  }

  config.set({
    plugins: ['karma-*', 'karma-concat-js'],
    frameworks: ['jasmine', 'concat_js'],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [process.env['DISPLAY'] ? 'TMPL_browser': 'TMPL_headlessbrowser'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    // note: run_karma.sh may override this as a command-line option.
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: 'TMPL_runfiles_path',

    files,
  })
}
