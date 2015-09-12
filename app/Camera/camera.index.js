var React = require('react-native');
var Camera = require('react-native-camera');
var config = require('../config');
var styles = require('./styles');
var { Icon, } = require('react-native-icons');
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
  _switchCamera() {
    var state = this.state;
    state.cameraType = state.cameraType === Camera.constants.Type.back
      ? Camera.constants.Type.front : Camera.constants.Type.back;
    this.setState(state);
  },
  _takePicture() {
    var venue = this.props.venue._id;
    var user = this.props.user
    this.refs.cam.capture(function(err, path) {
      var obj = {
          uri: path,
          uploadUrl: config.serverURL + '/api/media/',
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
        if (err) console.log('Error:', err);
        if (res) console.log('Response:', res);
      });
    });
  },
  render() {
    return (
      <Camera
        ref="cam"
        style={styles.cameraContainer}
        type={this.state.cameraType}
        captureTarget={Camera.constants.CaptureTarget.disk}>

        <TouchableHighlight 
          onPress={this._takePicture} 
          style={[styles.iconContainer, styles.test]}>
          <Icon  
            name='fontawesome|camera-retro'
            size={45}
            color='#FFF'
            style={styles.icon} />
        </TouchableHighlight>

        <TouchableHighlight 
          onPress={this._switchCamera} 
          style={[styles.iconContainer]}>
          <Icon  
            name='fontawesome|undo'
            size={45}
            color='#FFF'
            style={styles.icon} />
        </TouchableHighlight>
        
      </Camera>
    );
  }
});

module.exports = KrakenCam;