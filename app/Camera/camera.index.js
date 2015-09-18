var React = require('react-native');
var Camera = require('react-native-camera');
var Button = require('./button');
var RecordButton = require('./recordButton');
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
      captureTarget: Camera.constants.CaptureTarget.memory,
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
      alert('Picture Taken!');
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
        if (res) console.log('File Transfer Response:', res);
        else if (err) console.log('File Transfer Error:', err);
      });
    });
  },
  _record() {
    var venue = this.props.venue._id;
    var user = this.props.user;
    if (!this.state.isRecording) {

      // Start Countdown
      var context = this;
      var counterInterval = setInterval(function() {
        context.setState({counter: context.state.counter - 1});
      },1000);
      var counterTimeout = setTimeout(function() {
        this._stopRecording();
      }, 7000);  

      this.setState({'isRecording': true, 'counter': 7, 'counterInterval': counterInterval, 'counterTimeout': counterTimeout});
      this.refs.cam.capture({mode: 'video', audio: true}, function(err, path) {
        // This body is called when capture is complete
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
        // This starts the upload to S3
        NativeModules.FileTransfer.upload(obj, (err, res) => {
          if (res) console.log('File Transfer Response:', res);
          else if (err) console.log('File Transfer Error:', err);
        });
      });

    } else {
      this._stopRecording();
    }
  },

  _stopRecording() {
    clearInterval(this.state.counterInterval);
    clearTimeout(this.state.counterTimeout);
    this.setState({'counter': '', 'isRecording': false});
    this.refs.cam.stopCapture();
    alert('Uploading, your video will appear shortly!');
  },
  render() {
    return (

      <Camera
        ref="cam"
        style={styles.cameraContainer}
        type={this.state.cameraType}
        captureTarget={Camera.constants.CaptureTarget.disk}>

        <Text style={styles.counter}>{this.state.counter}</Text>

        <Button
          onPress={this._takePicture}
          icon='camera-retro' />
        <RecordButton
          onPress={this._record} 
          isRecording={this.state.isRecording} />
        <Button
           onPress={this._switchCamera}
           icon='undo' />
      </Camera>
    );
  }
});

module.exports = KrakenCam;