/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var MessagesTab = require('./app/Event/event.index');

var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  MapView
} = React;

var persnickety = React.createClass({
  render: function() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to Our App!
        </Text>
        <MapView
          style={styles.map}
          region={{
            latitude: 37.785834,
            longitude: -122.406417,
            latitudeDelta: 0,
            longitudeDelta: 0,
          }}
          //showsUserLocation={true}
          maxDelta={.3}
           />
        <Text style={styles.instructions}>
          To get started, edit index.ios.js
        </Text>
        <Text style={styles.instructions}>
          Press Cmd+R to reload,{'\n'}
          Cmd+D or shake for dev menu
        </Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  map: {
    position: 'absolute',
    right: 0,
    left: 0,
    top: 20,
    bottom: 50,
  },
});

AppRegistry.registerComponent('persnickety', () => persnickety);
