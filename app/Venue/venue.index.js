'use strict';

var React = require('react-native');
//var venue = require('./venueMock');

var {
  SliderIOS,
  Text,
  StyleSheet,
  View,
  } = React;

var VenueTab = React.createClass({
  getInitialState() {
    return {
      voteValue: 0,
      venue: 'initial venue',
      overallRating: 0
    };
  },

  _handleResponse(response) {
    console.log('ok');
    this.setState({venue: response});
    this.getOverallRating();
  },

  getOverallRating() {
    var ratings = this.state.venue.ratings;
    var sum = 0;
    for (var i = 0; i < ratings.length; i++) {
      sum += ratings[i];
    }
    var average = Math.round(sum / ratings.length);
    this.setState({overallRating: average});
  },

  setRoundVoteValue(voteValue) {
    voteValue *= 10;
    voteValue = Math.round(voteValue);
    this.setState({voteValue: voteValue})
  },

  render() {
    var venue;
    fetch('http://localhost:8000/api/venues/55e394d6c2b4e82b48390473')
      .then(response => response.json())
      .then(json => this._handleResponse(json));
    return (
      <View>
        <Text style={styles.header}>
          Waz Kraken
        </Text>
        <Text style={styles.venueName}>
          {this.state.venue.title}
        </Text>
        <Text style={styles.text} >
          Overall rating: {this.state.overallRating}/10
        </Text>
        <Text style={[styles.text, styles.yourRating]} >
          Your rating: {this.state.voteValue}
        </Text>
        <SliderIOS
          style={styles.slider}
          onValueChange={(voteValue) => this.setState({voteValue: Math.round(voteValue*10)})} />

      </View>
    );
  }
});

var styles = StyleSheet.create({
  slider: {
    height: 10,
    marginLeft: 40,
    marginRight: 40,
    flex: 0.5
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
  text: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    margin: 10,
  },
  yourRating: {
    marginTop: -10
  },
});

module.exports = VenueTab;