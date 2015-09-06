var React = require('react-native');
var config = require('../config');

var {
  Text,
  StyleSheet,
  View,
  ListView,
  TextInput,
  Image
  } = React;

var ImagesTab = React.createClass({

  render() {

    return (
      <View>
        <Text style={styles.header}>
          Images
        </Text>
      </View>
    )
  }

});

var styles = StyleSheet.create({
  header: {
    fontSize: 22,
    textAlign: 'center',
    marginTop: 20,
    backgroundColor: '#000000',
    color: '#ffffff'
  }
});






module.exports = ImagesTab;