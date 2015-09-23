var React = require('react-native');
var Display = require('react-native-device-display');
var {
  StyleSheet,
} = React;

module.exports = StyleSheet.create({

  // main view container
  container: {
    flexDirection: 'column',
    flex: 1,
  },
  // map view
  map: {
    flex: 5,
    top: 30
  },
  // main logo
  logo: {
  },

  autocompleteContainer: {
    position: 'absolute',
    top: 60,
    width: Display.width,
    paddingTop: 5,
    paddingBottom: 6,
    backgroundColor: '#CCC',
  },
  autocomplete: {
    width: Display.width * 0.95,
    marginLeft: Display.width * 0.025,
    height: 36,
    padding: 4,
    fontSize: 16,
    color: '#8C8C8C',
    borderRadius: 10,
    backgroundColor: 'white'
  },
  // header container and children
  headerContainer: {
    justifyContent: 'center',
    width: Display.width,
    height: 76,
    alignItems: 'center',
    backgroundColor: "#47b3c8",
  },
  // search bar
  searchContainer: {
    position: 'absolute',
    top: 90,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch'
  },
  venueName: {
    flex: 1,
    fontFamily: 'Avenir',
    fontSize: 20,
    textAlign: 'center',
    marginRight: 30,
    padding: 10,
    color: 'white',
  },
  // center button
  button: {
    height: 40,
    width: 40,
    position: 'absolute',
    bottom: 50,
    right: 40
  },
});
