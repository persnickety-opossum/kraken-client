'use strict';

var React = require('react-native');
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
    };
  },

  render() {
    return (
      <View>
        <Text style={styles.header}>
          Waz Kraken
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
  text: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    margin: 10,
  },
});

module.exports = VenueTab;