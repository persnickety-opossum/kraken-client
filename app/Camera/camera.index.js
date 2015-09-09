var React = require('react-native');
var Camera = require('react-native-camera');
var Display = require('react-native-device-display');
var mime = require('mime');
var {
  CameraRoll,
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  NativeModules
} = React;


var KrakenCam = React.createClass({
  getInitialState() {
    return {
      cameraType: Camera.constants.Type.back,
      captureTarget: Camera.constants.CaptureTarget.memory
    }
  },

  render() {

    return (
      <Camera
        ref="cam"
        style={styles.container}
        // onBarCodeRead={this._onBarCodeRead} New feature we could implement, specials?
        type={this.state.cameraType}
        captureTarget={Camera.constants.CaptureTarget.disk}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.ios.js{'\n'}
          Press Cmd+R to reload
        </Text>
        <TouchableHighlight onPress={this._switchCamera}>
          <Text>The old switcheroo</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this._takePicture}>
          <Text>Take Picture</Text>
        </TouchableHighlight>
      </Camera>
    );
  },
  _onBarCodeRead(e) {
    console.log(e);
  },
  _switchCamera() {
    var state = this.state;
    state.cameraType = state.cameraType === Camera.constants.Type.back
      ? Camera.constants.Type.front : Camera.constants.Type.back;
    this.setState(state);
  },

  _takePicture() {
    // var venue = this.props.venue._id;
    var venue = '55ee099fb34df23830581f29';
    // var user = this.props.user
    var user = '55ee099fb34df23830581f27';

    this.refs.cam.capture(function(err, path) {
      var obj = {
          uri: path,
          uploadUrl: 'http://10.8.1.143:5000/api/media/',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          data: {
            venue: venue,
            creator: user
          },
          mimeType: mime.lookup(path)
      };
      NativeModules.FileTransfer.upload(obj, (err, res) => {
        if (err) console.log('ERROR!>>>>>>>>>>>>>>>>>>>>>>>>', err);
        if (res) console.log('RESONSE!>>>>>>>>>>>>>>>>>>>>>>', res);
      });
    });
  }
});


var styles = StyleSheet.create({
  container: {
    height: Display.width,
    width: Display.width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
  },
});


module.exports = KrakenCam;