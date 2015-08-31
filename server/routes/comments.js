var express     = require('express');
var router      = express.Router();

var Comment     = require('./../db/Comment');
var Venue       = require('./../db/Venue');
var User        = require('./../db/User');

//get all comments
router.get('/', function(req, res) {
  Comment.find({}).populate('creator').populate('venue')
    .exec(function(err, comments){
      res.json(comments);
    });
});

//get a specific comment
router.get('/:id', function(req, res){
  var comment_id = req.params.id;
  Comment.findById(comment_id).populate('creator').populate('venue')
    .exec(function(err, comment){
      res.send(comment);
    });
});

// Expect POST object like:
// {
//   content: "Comment text",
//   creator: "55e39290c2b4e82b4839046a", // ID of the user posting the comment
//   venue: "55e394d6c2b4e82b48390473", // ID of the event that the comment is associated with
//   datetime: "2016-03-30T06:20:46.000Z",
//   atVenue: true
// }

router.post('/', function(req, res) {

  var data = req.body;

  var addComment = Comment.create({
      content: data.content,
      creator: data.creator,
      venue: data.venue,
      datetime: data.datetime,
      atVenue: data.atVenue
    },
    function(err, newComment){
      // Add the comment_id to the comments array in the events model
      Venue.findById(data.venue, function(err, venue){
        venue.comments.push(newComment._id);
        venue.save(function(err){
          //Saved!
          res.send(newComment);
        });
      });
    });
});

module.exports = router;
