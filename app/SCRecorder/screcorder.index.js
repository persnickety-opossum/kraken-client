var React     = require('react-native');
var Recorder  = require('react-native-screcorder');
var Button = require('react-native-button');
var Video = require('react-native-video');
var Display = require('react-native-device-display');

var {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableWithoutFeedback ,
  CameraRoll,
  Modal
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
  },

  capture: function() {
    this.refs.recorder.capture((err, url) => {
      // Playing with the picture
      if(err) {
        console.log(err);
      } else {
        console.log(url);
        CameraRoll.saveImageWithTag(url);
      }
    });
  },

  pause: function() {
    this.refs.recorder.pause();
    this.setState({recording: false});
  },

  save: function() {
    this.refs.recorder.save((err, url) => {
      // Playing with the generated video
      if(err) {
        console.log(err);
      } else {
        console.log(url);
      }
    });
  },

  saveToCameraRoll: function() {
    this.refs.recorder.saveToCameraRoll((err, url) => {
      // Playing with the generated video
      if(err) {
        console.log(err);
      } else {
        console.log('Saved to CameraROLL!: ' + url);
      }
    });
  },

  view: function() {
    this.refs.recorder.save((err, url) => {
      // Playing with the generated video
      if(err) {
        console.log(err);
      } else {
        console.log(url);
        this.setModalVisible(true, url);
      }
    });
  },

  setModalVisible: function(visible, uri) {
    console.log('modal set to visible');
    this.setState({modalVisible: visible, uri: uri});
  },

  showImageOrVideo: function() {
    if (this.state.uri) {
      console.log('video time!' + this.state.uri);
      return (
        <Video source={{uri: this.state.uri}}
          rate={1.0}
          volume={1.0}
          muted={false}
          paused={false}
          resizeMode="cover"
          repeat={true}
          style={styles.video} />
      )
    }
  },

  setDevice: function() {
    var device = (this.state.device == "front") ? "back" : "front";
    this.setState({device: device});
  },

  onNewSegment: function(segment) {
    this.setState({segment: segment});
  },

  removeAllSegments: function() {
    this.refs.recorder.removeAllSegments();
    this.setState({segment: null});
  },

  render: function() {
    return (
      <View style={styles.wrapper}>
        <Recorder
          ref="recorder"
          config={this.state.config}
          device={this.state.device}
          onNewSegment={this.onNewSegment}
          style={styles.recorder}>
        </Recorder>
        <View style={styles.controls}>
          <TouchableHighlight onPress={this.setDevice} style={styles.recorder.device}>
            <Text>Flip</Text>
          </TouchableHighlight>
          <TouchableHighlight onPressIn={this.record} onPressOut={this.pause}>
            <Text>Record</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.view}>
            <Text>View Video</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.saveToCameraRoll}>
            <Text>Save Video</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.removeAllSegments}>
            <Text>Reset Video</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.capture}>
            <Text>Take Photo</Text>
          </TouchableHighlight>
        </View>
        <Modal visible={this.state.modalVisible === true}>
          <View style={styles.modalContainer}>
            <View style={styles.innerContainer}>
              {this.showImageOrVideo()}
              <Button
                onPress={this.setModalVisible.bind(this, false)}
                style={styles.modalButton}>
                Close
              </Button>
            </View>
          </View>
        </Modal>
      </View>

    );
  }
});

var styles = StyleSheet.create({

  wrapper: {
    flex: 1,
  },
  recorder: {
    flex: 5,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 50
  },

  device: {
    position: 'absolute',
    top: 100,
    height: 36,
    width: 100,
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