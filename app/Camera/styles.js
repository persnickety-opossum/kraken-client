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
    marginLeft: 5,
    marginBottom: 5,
  },
  icon: {
    height: 45,
    width: 45,
  },
});

