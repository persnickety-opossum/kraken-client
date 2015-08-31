// Bring Mongoose into the app 
var mongoose = require( 'mongoose' );

// Build the connection string 
var dbURI = 'mongodb://localhost/wazkraken';

// Create the database connection 
var db = mongoose.connect(dbURI);

mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + dbURI);
});

module.exports = db;