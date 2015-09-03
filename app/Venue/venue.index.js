'use strict';

var React = require('react-native');
//var venue = require('./venueMock');
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
  //  //return ArticleStore.reload() // returns a Promise of reload completion
    console.log(this.state.venue);
    console.log('device height:     ', Display.height);
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
    fetch(config.serverURL + '/api/users/', {
      method: 'POST',
      body: {token: config.userToken}
    }) // no ;
    .then(response => response.json())
    .then(json => this.setState({user: json[0]._id}));
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
    //return <Text>{comments.datetime}: {comments.content}</Text>
    return <Text>{comments}</Text>
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
        <Text style={styles.text} >
          Overall rating: {venue.overallRating}
        </Text>
        <Text style={[styles.text, styles.yourRating]} >
          Your rating: {this.state.voteValue}
        </Text>
        <SliderIOS
          style={styles.slider}
          onValueChange={(voteValue) => this.setState({voteValue: Math.round(voteValue*10)})}
          maximumTrackTintColor='red'/>
        <TextInput
          style={{height: 40, borderColor: 'gray', borderWidth: 1}}
          onChangeText={(text) => this.setState({text})}
          value={this.state.text}
          />
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
  listView: {
    margin: 10,
    flex: 1,
    bottom: 0,
    height: Display.height*.30
  }
});

module.exports = VenueTab;