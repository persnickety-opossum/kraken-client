'use strict';

var React = require('react-native');
var {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  WebView
} = React;

var SettingsTab= React.createClass({

  getInitialState: function() {
    return {
      loading: true,
      scalesPageToFit: true,
    };
  },

  render: function() {
    return (
      <View>
        <Text>Settings</Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({

});

module.exports = SettingsTab;