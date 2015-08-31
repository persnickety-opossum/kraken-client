var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  token: String,
  venues: [{ //in case we want users to save their favorite venues
    type : mongoose.Schema.Types.ObjectId,
    ref: 'Venue'
  }],
  coordinates: { //user's location
    type: String
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = User;