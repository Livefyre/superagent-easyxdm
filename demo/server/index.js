var server = require('express')();

var STATIC_DIR = __dirname + '/static';

// Serve a JSON API
server.get('/api', function (req, res, next) {
  res.status(200).json({ me: '/api' });
});

// Serve a browserified version of ./demo.js at /demo.js
server.use(require('browserify-dev-middleware')({
  src: __dirname + '/..'
}));

// Serve static files from the ./static directory
server.use(require('serve-static')(STATIC_DIR))

require('portfinder').getPort(function (err, port) {
  console.log("Listening on port "+port);
  server.listen(port);
});
