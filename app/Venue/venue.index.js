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
      venue: 'initial venue'
    };
  },

  _handleResponse(response) {
    this.setState({venue: response});
  },

  render() {
    var venue;
    fetch('http://localhost:8000/api/venues/55e3a524bc3b937b5c6fd30d') //doesnt work yet.
      .then(response => response.json())
      .then(json => this._handleResponse(json.response));
    return (
      <View>
        <Text style={styles.header}>
          Waz Kraken
        </Text>
        <Text style={styles.venueName}>
          {this.state.venue}
        </Text>
        <Text style={styles.text} >
          Kraken Rating: {this.state.voteValue}
        </Text>
        <SliderIOS
          style={styles.slider}
          onValueChange={(voteValue) => this.setState({voteValue: voteValue})} />
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
    marginTop: 20
  },
  venueName: {
    fontSize: 18,
    textAlign: 'center'
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    margin: 10,
  },
});

module.exports = VenueTab;