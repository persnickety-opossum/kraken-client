var React = require('react-native');
var Display = require('react-native-device-display');
var {
  StyleSheet,
} = React;

module.exports = StyleSheet.create({
  cameraContainer: {
    height: Display.height,
    width: Display.width,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  iconContainer: {
    flex: 0,
    padding: 15,
    borderRadius: 37,
    marginBottom: 5,
    marginLeft: 5
  },
  icon: {
    height: 44,
    width: 44,
  },
  counter: {
    position: 'absolute',
    fontSize: 80,
    color: 'white',
    width: Display.width,
    textAlign: 'center'
  },
  iconCamera: {
    backgroundColor: '#66D9EF',
  },
  iconSwitch: {
    padding: 0,
    top: 30,
    right: 10,
    position: 'absolute',
    width: 44,
    height: 44,
  },
  iconRecord: {
    backgroundColor: '#F92672',
  }
});

