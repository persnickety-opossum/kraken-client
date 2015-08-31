var express     = require('express');
var mongoose    = require('mongoose');
var bodyParser  = require('body-parser');
var db          = require('./db/db');
//var auth        = require('./utils/authenticate');

// Load the models
var Comment     = require('./db/Comment');
var Venue       = require('./db/Venue');
var User        = require('./db/User');

// Load routes
var venuesRoute   = require('./routes/venues');
var usersRoute    = require('./routes/users');
var commentsRoute = require('./routes/comments');

var app = express();

//app.use(express.static(__dirname + '/../app'));

app.use(bodyParser.json());

// Define routes
app.use('/api/venues', venuesRoute);
app.use('/api/users', usersRoute);
app.use('/api/comments', commentsRoute);

app.listen(8000, function() {
  console.log("Listening on Port 8000");
});

module.exports = app;