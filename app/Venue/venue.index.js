'use strict';

var React = require('react-native');
//var venue = require('./venueMock');
var Button = require('react-native-button');
var moment = require('moment');
moment().format();
var Display = require('react-native-device-display');
var KeyboardEvents = require('react-native-keyboardevents');
var KeyboardEventEmitter = KeyboardEvents.Emitter;

var {
  SliderIOS,
  Text,
  StyleSheet,
  View,
  ListView,
  TextInput
  } = React;

var config = require('../config');

var RefreshableListView = require('react-native-refreshable-listview');
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

var VenueTab = React.createClass({
  getInitialState() {
    KeyboardEventEmitter.on(KeyboardEvents.KeyboardDidShowEvent, (frames) => {
      this.setState({keyboardSpace: frames.end.height});
    });
    KeyboardEventEmitter.on(KeyboardEvents.KeyboardWillHideEvent, (frames) => {
      this.setState({keyboardSpace: 0});
    });
    return {
      voteValue: 0,
      venue: this.props.venue,
      overallRating: 0,
      dataSource: ds.cloneWithRows(this.props.venue.comments),

      keyboardSpace: 0
    };
  },

  updateKeyboardSpace(frames) {
    this.setState({keyboardSpace: frames.end.height});
  },

  resetKeyboardSpace() {
    this.setState({keyboardSpace: 0});
  },

  componentDidMount: function() {
    //this.setState({venue: this.props.venue});
    //this.setState({dataSource: ds.cloneWithRows(this.props.venue.comments)})
    KeyboardEventEmitter.on(KeyboardEvents.KeyboardDidShowEvent, this.updateKeyboardSpace);
    KeyboardEventEmitter.on(KeyboardEvents.KeyboardWillHideEvent, this.resetKeyboardSpace);

  },

  reloadComments() {
    var route = config.serverURL + '/api/venues/' + this.state.venue._id;
    fetch(route)
      .then(response => response.json())
      .then(function(res) {
        for (var i = 0; i < res.comments.length; i++) {
          res.comments[i].datetime = moment(res.comments[i].datetime).fromNow();
        }
        return res;
      })
      .then(json => this.setState({venue: json, dataSource: ds.cloneWithRows(json.comments)}))
  },

  componentWillReceiveProps: function(nextProps) {
    var venue = nextProps.venue;
    var route = config.serverURL + '/api/venues/' + venue._id;
    fetch(route)
      .then(response => response.json())
      .then(json => this.setState({venue: json, dataSource: ds.cloneWithRows(json.comments)}))
    //this.setState({
    //  venue: venue,
    //  dataSource: ds.cloneWithRows(venue.comments)
    //});
  },

  componentWillMount: function() {
    // retrieve user id, may be replaced with device UUID in the future
    var context = this;
    fetch(config.serverURL + '/api/users/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({token: config.userToken})
    }) // no ;
    .then(response => response.json())
    .then(json => context.setState({user: json._id}));
  },

  getOverallRating() {
    var ratings = this.state.venue.ratings;
    var sum = 0;
    for (var i = 0; i < ratings.length; i++) {
      sum += ratings[i].rating;
    }
    var average = Math.round(sum / ratings.length);
    this.setState({overallRating: average});
  },

  setRoundVoteValue(voteValue) {
    voteValue *= 10;
    voteValue = Math.round(voteValue);
    this.setState({voteValue: voteValue})
  },

  renderComments(comments) {
    return <Text>{comments.datetime}: {comments.content}</Text>
    //return <Text>{comments}</Text>
  },

  submitComment() {
    //this gets called when "submit comment" gets pushed.
    // {
//   content: "Comment text",
//   creator: "55e39290c2b4e82b4839046a", // ID of the user posting the comment
//   venue: "55e394d6c2b4e82b48390473", // ID of the event that the comment is associated with
//   datetime: "2016-03-30T06:20:46.000Z",
//   atVenue: true
// }
    var that = this;
    if (this.state.text) {
      var content = this.state.text;
      //TODO: make creator the actual creator, not a hardcoded creator
      var creator = '55e77657a7b095b7227c49ab'; //hardcoded for now
      var venue = this.state.venue._id;
      var datetime = new Date().toISOString();
      var atVenue = true;
      console.log('This is the post object: ', content, creator, venue, datetime, atVenue);
      fetch(config.serverURL + '/api/comments/', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: content,
          creator: creator,
          venue: venue,
          datetime: datetime,
          atVenue: atVenue
        })
      })
        .then(function(res) {
          that.setState({text: ''});
          that.reloadComments();
          return res.json();
        })
    }
  },

  render() {
    var venue = this.props.venue;
    return (
      <View>
        <Text style={styles.header}>
          Waz Kraken
        </Text>
        <Text style={styles.venueName}>
          {venue.title}
        </Text>
        <Text style={[styles.text, styles.alignLeft]} >
          Venue description: {venue.description}
        </Text>
        <Text style={[styles.text, styles.alignLeft]} >
          Address: {venue.address}
        </Text>
        <Text style={styles.text} >
          Time: {venue.datetime}
        </Text>
        <Text style={[styles.text, styles.yourRating]} >
          Overall rating: {venue.overallRating} | Your rating: {this.state.voteValue}
        </Text>
        <SliderIOS
          style={styles.slider}
          onValueChange={(voteValue) => this.setState({voteValue: Math.round(voteValue*10)})}
          onSlidingComplete={(voteValue) => {
            fetch(config.serverURL + '/api/venues/' + venue.id)
            .then(response => response.json())
            .then(modVenue => {
              for (var i = 0; i < modVenue.ratings.length; i++) {
                if (modVenue.ratings[i].user === this.state.user) {
                  modVenue.ratings[i].rating = Math.round(voteValue*10);
                  break;
                }
              }
              if (i === modVenue.ratings.length) {
                modVenue.ratings.push({
                  rating: Math.round(voteValue*10),
                  user: this.state.user
                });
              }
              fetch(config.serverURL + '/api/venues/', {
                method: 'put',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(modVenue)
              });
            });
          }}
          maximumTrackTintColor='red'/>
        <TextInput
          style={styles.textInput}
          onChangeText={(text) => this.setState({text})}
          value={this.state.text}
        />
        <Button style={styles.commentButton} onPress={this.submitComment}>
          Submit Comment
        </Button>
        <RefreshableListView
          style={styles.listView}
          dataSource={this.state.dataSource}
          renderRow={this.renderComments}
          loadData={this.reloadComments}
          refreshDescription="Refreshing comments"
          />
        <View style={{height: this.state.keyboardSpace}}></View>
      </View>

    );
  }
});

var styles = StyleSheet.create({
  text: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    margin: 3,
  },
  alignLeft: {
    //textAlign: 'left'
  },
  header: {
    fontSize: 22,
    textAlign: 'center',
    marginTop: 20,
    backgroundColor: '#000000',
    color: '#ffffff'
  },
  venueName: {
    fontSize: 20,
    textAlign: 'center'
  },
  yourRating: {
    marginBottom: 5
  },
  slider: {
    marginTop: 8,
    height: 20,
    marginLeft: 40,
    marginRight: 40,
    marginBottom: 10,
    flex: 0.5
  },
  textInput: {
    height: 30,
    borderColor: 'gray',
    margin: 5,
    marginBottom: 15,
    borderWidth: 1
  },
  commentButton: {
    fontSize: 20,
    flex: 1,
    textAlign: 'right',
    right: 10,
    alignSelf: 'flex-end'
  },
  listView: {
    margin: 10,
    flex: 1,
    bottom: 0,
    height: Display.height * 0.49,
    //bottom: Display.height - (Display.height - 50)
  }
});

module.exports = VenueTab;