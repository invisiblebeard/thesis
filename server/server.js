var express = require('express');
var morgan = require('morgan');
var parser = require('body-parser');
var routes = require('./routes.js');
var env = require('node-env-file');
var helpers = require('./helpers.js');

if(!process.env.TRAVIS) {
  env(__dirname + '../../.env');
}

var app = express();
var port = process.env.PORT || 8080;

app.use(morgan('tiny'));
app.use(parser());
app.use('/', express.static(__dirname + '../../client'));

var server = app.listen(port, function() {
  console.log('listening on port', port);
  helpers.spotCleaner();
  setTimeout(helpers.spotCleaner, 3600000);
});

var io = require('socket.io')({
 transports: ["xhr-polling"],
 'polling duration': 10
}).listen(server);

routes(app, express, io);
