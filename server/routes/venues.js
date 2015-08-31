var express    = require('express');
var router     = express.Router();
var Venue      = require('./../db/Venue');
var User       = require('./../db/User');
var Comment    = require('./../db/Comment');

//need to add functionality to only get venues near the user?
// Or should this get all venues, regardless of user location?
router.get('/', function(req, res) {
  Venue.find({}).populate('creator').populate('comments')
    .exec(function(err, events){
      res.json(events);
    });
});

// Return specific venue by ID
router.get('/:id', function(req, res){
  var venue_id = req.params.id;
  Venue.findById(venue_id).populate('creator').populate('comments')
    .exec(function(err, event){
      res.send(event);
    });
});

//get the current date in correct format (use this on the client side)
//var currDateTime = new Date();
//var currYear = currDateTime.getFullYear();
//var currMonth = currDateTime.getMonth();
//var currDay = currDateTime.getDate();
//var currHour = currDateTime.getHours();
//var currMinute = currDateTime.getMinutes();
//
//get correct datemin format
//$scope.datemin = currDateTime.toISOString().split('T')[0] + 'T00:00:00';
//$scope.datetime = new Date(currYear, currMonth, currDay, currHour, currMinute);

// Expect POST object like: (attendees, ratings, comments gets filled in automatically)
// {
//   "title": "Tempest",
//   "description": "A laid-back bar.",
//   "address": "431 Natoma St., San Francisco, CA",
//   "coordinates": "37.7811679,-122.4062895",
//   "creator": "55e39106c2ebec404648c18e",
//   "datetime": "2015-08-30T06:20:46" ("yyyy-MM-ddTHH:mm:ss")
// }

router.post('/', function(req, res) {

  var data = req.body;

  var addVenue = Venue.create({
      title: data.title,
      description: data.description,
      address: data.address,
      coordinates: data.coordinates,
      creator: data.creator,
      datetime: data.datetime //a venue will have a time that a specific event starts
    },
    function(err, newVenue){
      res.send(newVenue);
    }
  );
});

//mainly for updating a venue's ratings, attendees, and comments
router.put('/', function(req, res) {
  var id = req.body._id;
  Venue.findByIdAndUpdate(id, req.body, function(err) {
    if (err) {
      return res.send(500, err);
    }
  });
  res.send(req.body);
});

module.exports = router;
