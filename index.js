'use strict';

var spawn = require('child_process').spawn

module.exports = spawnAsync;

function spawnAsync (cmd, args, _options) {
  var proc,
      stdout,
      stderr,
      options = _options || {},
      stdinStream = options.stdinStream,
      stdoutStream = options.stdoutStream,
      stderrStream = options.stderrStream;

  return new Promise (function (resolve, reject) {
    proc = spawn(cmd, args, options);

    if (stdinStream) {
      stdinStream.pipe(proc.stdin);
    }

    if (stdoutStream) {
      proc.stdout.pipe(stdoutStream);
    } else {
      stdout = '';
      proc.stdout.setEncoding('utf8');
      proc.stdout.on('data', function (data) {
        stdout += data;
      });
    }

    if (stderrStream) {
      proc.stderr.pipe(stderrStream);
    } else {
      stderr = '';
      proc.stderr.setEncoding('utf8');
      proc.stderr.on('data', function (data) {
        stderr += data;
      });
    }

    proc.on('error', function (err) {
      err.stdout = stdout;
      err.stderr = stderr;
      reject(err);
    });

    proc.on('exit', function (code) {
      if (options.ignoreStatusCode || code === 0) {
        resolve(stdout, stderr);
      } else {
        var e = new Error('StatusCode: ' + code);
        e.statusCode = code
        e.stderr = stderr;
        e.stdout = stdout;
        reject(e);
      }
    });
  });
}
