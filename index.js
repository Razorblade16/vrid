const path = require('path');
const http = require('http');

const express = require('express');
const rollup = require('rollup');
const rollupPluginNodeResolve = require('rollup-plugin-node-resolve');
const rollupPluginCommonJs = require('rollup-plugin-commonjs');
const rollupPluginJson = require('rollup-plugin-json');
const Busboy = require('busboy');

const _requestRollup = p => rollup.rollup({
  entry: p,
  plugins: [
    rollupPluginNodeResolve({
      main: true,
      preferBuiltins: false,
    }),
    rollupPluginCommonJs(),
    rollupPluginJson(),
  ],
})
  .then(bundle => {
    const result = bundle.generate({
      moduleName: module,
      format: 'cjs',
      useStrict: false,
    });
    const {code} = result;
    const wrappedCode = '(function() {\n' + code + '\n})();\n';
    return wrappedCode;
  });

_requestRollup(path.join('lib', 'index.js'))
  .then(indexJs => {
    const app = express();

    app.get('/js/index.js', (req, res, next) => {
      res.type('application/javastript');
      res.send(indexJs);
    });
    app.put(/^\/assets\/(.+)$/, (req, res, next) => {
      const busboy = new Busboy({
        headers: req.headers,
      });
      busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        file.on('data', data => {
          console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
        });
        file.on('end', () => {
          console.log('File [' + fieldname + '] Finished');
        });
      });
      busboy.on('finish', () => {
        console.log('finished');

        res.send();
      });

      req.pipe(busboy);
    });
    app.use('/', express.static('public'));

    http.createServer(app)
      .listen(3000, err => {
        if (!err) {
          console.log('http://127.0.0.1:3000');
        } else {
          console.warn(err);
        }
      });
  })
  .catch(err => {
    console.warn(err);
  });
