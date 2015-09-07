var React = require('react-native');
var Camera = require('react-native-camera');
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
        onBarCodeRead={this._onBarCodeRead}
        type={this.state.cameraType}
        captureTarget={Camera.constants.CaptureTarget.disk}
      >
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
    this.refs.cam.capture(function(err, path) {



      // console.log('path >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', path);


      // var obj = {
      //     uri, // either an 'assets-library' url (for files from photo library) or an image dataURL
      //     uploadUrl,
      //     fileName,
      //     mimeType,
      //     headers,
      //     data: {
      //         // whatever properties you wish to send in the request
      //         // along with the uploaded file
      //     }
      // };
      // NativeModules.FileTransfer.upload(obj, (err, res) => {
      //     // handle response
      //     // it is an object with 'status' and 'data' properties
      //     // if the file path protocol is not supported the status will be 0
      //     // and the request won't be made at all
      // });



      //CameraRoll.getPhotos(fetchParams, this.storeImages, this.logImageError);
      // console.log(path, '<<<<<<<<<<<<<<<<<<<<<<<<< PATH')
      // NativeModules.ReadImageData.readImage(path, (image) => {
      //     console.log(image);
      //    fetch('http://10.1.10.39:5000/api/media/venue/', {
      //       method: 'POST',
      //       headers: {
      //         'Accept': 'application/json',
      //         'Content-Type': 'application/json'
      //       },
      //       body: JSON.stringify({photo: image}),
      //     });
      // });

      // RNFS.readFile(path)
      //   .then(function(content) {

      //    fetch('http://10.1.10.39:5000/api/media/venue/', {
      //       method: 'POST',
      //       headers: {
      //         'Accept': 'application/json',
      //         'Content-Type': 'application/json'
      //       },
      //       body: JSON.stringify({photo: content}),
      //     });
      //   })

      // fetch('http://10.1.10.39:5000/api/media/venue/', {
      //   method: 'POST',
      //   headers: {
      //     'Accept': 'application/json',
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     name: 'photo'
      //   })
      // })
      // .then(response => response.json());
    });
  }
});


var styles = StyleSheet.create({
  container: {
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