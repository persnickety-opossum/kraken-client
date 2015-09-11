var React     = require('react-native');
var Recorder  = require('react-native-screcorder');
var Button = require('react-native-button');
var Video = require('react-native-video');
var Display = require('react-native-device-display');

var {
  View,
  Image,
  StyleSheet
} = React;

var VideoTab = React.createClass({

  getInitialState: function() {
    return {
      device: "front",
      recording: false,
      segment: null
    }
  },

  record: function() {
    this.refs.recorder.record();
    this.setState({recording: true});
    console.log('recording');
  },

  capture: function() {
    this.refs.recorder.capture((err, url) => {
      // Playing with the picture
    });
  },

  pause: function() {
    this.refs.recorder.pause();
    this.setState({recording: false});
  },

  save: function() {
    this.refs.recorder.save((err, url) => {
      // Playing with the generated video
    });
  },

  setDevice: function() {
    var device = (this.state.device == "front") ? "back" : "front";
    this.setState({device: device});
  },

  onNewSegment: function(segment) {
    this.setState({segment: segment});
  },

  render: function() {
    return (
      <View style={styles.container}>
        <Recorder
          ref="recorder"
          config={this.state.config}
          device={this.state.device}
          onNewSegment={this.onNewSegment}
          style={styles.wrapper}>
        </Recorder>
        <View style={styles.controls}>
          <Button onPressOut={this.setDevice} style={styles.device}>flip </Button>
          <Button style={styles.device} onPressIn={this.record} onPressOut={this.pause}>record</Button>
          <Button style={styles.device} onPressOut={this.save} icon="heart">save</Button>
        </View>
      </View>

    );
  }

});

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
  device: {
    flex: 1,
    height: 36,
    width: 100,
    color: 'blue'
  },

  controls: {
    flex: 1,
    position: 'absolute',
    top: 0,
    height: 150,
    width: 100,
  },


   modalContainer: {
    flex: 1,
    justifyContent: 'center',
    //padding: 20,
    alignItems: 'center',
    backgroundColor: '#f5fcff'
  },
  innerContainer: {
    alignItems: 'flex-end',
  },
  image: {
    flex: 1,
    height: Display.width*1.33333,
    width: Display.width
  },

  modalButton: {
    flex: 1,
    marginTop: 10,
    marginRight: 5,
    alignSelf: 'flex-end',
    right: 0,
    fontSize: 20
  },

  video: {
    //position: 'absolute',
    height: Display.width*1.33333,
    width: Display.width,
    flex: 1,
    margin: 0,
    padding: 0
  },
});

module.exports = VideoTab;