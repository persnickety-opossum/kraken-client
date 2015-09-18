var React = require('react-native');
var styles = require('./styles');
var Button = require('./button');
var { Icon, } = require('react-native-icons');

var {
  Text,
  TouchableHighlight,
} = React;

var RecordButton = React.createClass({
  render() {
    if (!this.props.isRecording) {
      return (
        <Button 
          onPress={this.props.onPress}
          icon='video-camera' />
      );
    }
    else {
      return (
        <Button 
          onPress={this.props.onPress}
          icon='stop' />
      );
    }
  }
});

module.exports = RecordButton;