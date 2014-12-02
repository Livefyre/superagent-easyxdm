var express = require('express');

var apiServer = express()
    // CORS is not needed when using easyXDM.
    // However, your API may want to use it anyway so that modern browsers
    // can use XHR CORS intead of easyXDM
    // .use(require('cors')())
    // Logger
    .use(require('morgan')('combined'))
    ;

/**
 * Serve a JSON API
 */
apiServer.all('/api', function (req, res, next) {
  var method = req.method;
  var bodyText = '';
  req.on('data', function (chunk) {
    bodyText += chunk;
  });
  req.on('end', function () {
    console.log('ended streaming request: ', bodyText);
    var body = bodyText;
    if (req.get('content-type') === 'application/json') {
      try {
        body = JSON.parse(body);        
      } catch (e) {
        return res.status(400).json({
          error: "Couldn't parse body as JSON: "+body
        });
      }
    }
    res.status(201).json({
      self: '/api',
      method: method,
      body: body
    });
  });
});
// API Server exposes easyxdm.html for proxying
apiServer.use(require('serve-static')(__dirname+'/api-static'));

/**
 * Serve on another port (origin) index.html, which is a demo
 * of a relying origin hitting the API.
 */
var staticServer = express();
// Serve a browserified version of ./demo.js at /demo.js
staticServer.use(require('browserify-dev-middleware')({
  src: __dirname + '/..'
}));

// Serve static files from the ./static directory
staticServer.use(require('serve-static')(__dirname+'/static'));

require('portfinder').getPort(function (err, port) {
  var staticServerPort = port + 1;
  console.log("API listening on port "+port);
  console.log("Static Server listening on port "+staticServerPort);
  apiServer.listen(port);
  staticServer.listen(staticServerPort);
});
