var React = require('react-native');
var Display = require('react-native-device-display');
var {
  StyleSheet,
} = React;

var styles = StyleSheet.create({

  // venue view container
  main: {
    flex: 1,
  },

  // general text style
  text: {
    flex: 1,
    fontFamily: 'Avenir',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    margin: 3,
  },

  // header container and children
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: Display.width,
    height: 60,
    alignItems: 'center',
    backgroundColor: "#47b3c8",
    paddingTop: 16
  },
  venueName: {
    flex: 1,
    fontFamily: 'Avenir',
    fontSize: 20,
    textAlign: 'center',
    marginRight: 30,
    padding: 10,
    color: 'white',
  },
  
  // thumbnail for media
  thumbImage: {
    flex: 1,
    width: 120,
    height: 120,
    margin: 0,
    padding: 0,
    borderRadius: 5,
    marginRight: 5
  },
  thumbView: {
    flex: 1,
    height: 70,
    width: 70,
    margin: 0,
    padding: 0
  },

  // scroll view for media
  mediaContainer: {
    paddingTop: 5,
    paddingLeft: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalScrollView: {
    height: 120,
    width: Display.width,
  },

  // slider
  slider: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    alignItems: 'stretch',
    justifyContent: 'center',
  },

  // comments refreshable view
  refreshableListView: {
    flex: 1,
    flexDirection: 'column',
    marginTop: 10,
    // height: Display.height * 0.49
  },
  commentIcon: {
    height: 34,
    width: 34,
    marginRight: 10,
    borderWidth: 0,
    borderRadius: 17,
    borderColor: 'gray',
    backgroundColor: 'gray'
  },

  // comment input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#E5F7FA'
  },
  textInput: {
    flex: 1,
    height: 30,
    borderWidth: 1,
    borderColor: '#66d9ef',
    color: '#8C8C8C',
    backgroundColor: 'white'
  },
  // camera button
  cameraButton: {
    flex: 0,
    height: 30,
    width:30,
  },
  cameraIcon: {
    height: 30,
    width: 30,
    marginRight: 8,
  },

  // scroll view container for comments
  contentContainer: {
    height: 70,
    //width: 70,
    flex: 1,
    margin: 0,
    padding: 0
  },
  commentContainer: {
    flex: 1,
    padding: 5,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#E3E3E3'
  },
  commentText: {
    flex: 1
  },
  // info modal
// info modal
  popupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch'
  },
  infoPopup: {
    height: 300,
    width: 300,
    padding: 20
  },
  infoButton: {
    flex: 1,
    alignSelf: 'flex-end',
  },
  infoIcon: {
    height: 20,
    width: 20,
    marginRight: 10,
    marginLeft: 10,
  },
  venueNameLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#47b3c8',
    marginBottom: 20,
  },
  attendeeContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },


  // camera modal
  modalCameraContainer: {
    flex: 1,
    justifyContent: 'center',
    //padding: 20,
    alignItems: 'center',
    backgroundColor: '#f5fcff',
    
  },

  // media modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    //padding: 20,
    alignItems: 'center',
    backgroundColor: '#f5fcff'
  },
  innerContainer: {
    alignItems: 'flex-end',
    height: Display.height,
    width: Display.width,
  },
  image: {
    flex: 1,
    height: Display.height,
    width: Display.width
  },
  modalButton: {
    position: 'absolute',
    flex: 0,
    bottom: 5,
    right: 5
  },
  modalButtonLeft: {
    position: 'absolute',
    flex: 0,
    bottom: 5,
    left: 5
  },
  modalButtonIcon: {
    height: 45,
    width: 45,
  },
  modalFlag: {
    position: 'absolute',
    height: 20,
    width: 20,
    bottom: 5,
    left: 5
  },
  video: {
    //position: 'absolute',
    height: Display.width*1.33333,
    width: Display.width,
    flex: 1,
    margin: 0,
    padding: 0
  },
  thumbVideo: {
    flex: 1,
    width: 40,
    height: 70,
    margin: 0,
    padding: 0
  },
  icon: {
    height: 20,
    width: 20,
    marginRight: 5,
    marginLeft: 0,
    padding: 0
  },
  refreshImage: {
    height: 30,
    width: 30,
    justifyContent:'center',
    backgroundColor:'transparent',
    marginBottom: 10
  },
  refreshImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

module.exports = styles;