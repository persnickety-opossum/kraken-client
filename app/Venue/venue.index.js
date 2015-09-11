'use strict';

var React = require('react-native');
var DeviceUUID = require("react-native-device-uuid");
//var venue = require('./venueMock');
var Button = require('react-native-button');
var moment = require('moment');
moment().format();
var Display = require('react-native-device-display');
var KeyboardEvents = require('react-native-keyboardevents');
var KeyboardEventEmitter = KeyboardEvents.Emitter;
var EventEmitter = require('EventEmitter');
var Subscribable = require('Subscribable');
var Video = require('react-native-video');
var { Icon, } = require('react-native-icons');

var KrakenCamera = require('../Camera/camera.index');

var config = require('../config');

var {
  Image,
  LayoutAnimation,
  ListView,
  Modal,
  SliderIOS,
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  } = React;

var RefreshableListView = require('react-native-refreshable-listview');
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

// Sockets
window.navigator.userAgent = "react-native";
var io = require('socket.io-client/socket.io');
var socket = io.connect(config.serverURL);

var VenueTab = React.createClass({
  mixins: [Subscribable.Mixin],
  getInitialState() {
    return {
      voteValue: 0,
      venue: this.props.venue,
      overallRating: 0,
      attendeeCount: Object.keys(this.props.venue.attendees).length,
      dataSource: ds.cloneWithRows(this.props.venue.comments),
      keyboardSpace: 0,
      bottom: 49,
      modalCameraVisible: false,
      userLastRating: 0
      media: []
    };
  },

  // helper function to update view height when keyboard appears
  updateKeyboardSpace(frames) {
    LayoutAnimation.configureNext(animations.layout.spring);
    this.setState({keyboardSpace: frames.end.height});
    this.setState({bottom: 0});
  },

  // helper function to update view height when keyboard is off screen
  resetKeyboardSpace() {
    LayoutAnimation.configureNext(animations.layout.easeInEaseOut);
    this.setState({keyboardSpace: 0});
    this.setState({bottom: 49});
  },

  changeVenue(venue) {
    alert(venue);
    this.setState({'venue': venue});
  },

  fetchMedia(venue) {
    var context = this;
    context.setState({media: []}); // Otherwise it just keeps adding on to media?
    var route;
    if (venue) route = config.serverURL + '/api/media?venue=' + venue._id;
    else route = config.serverURL + '/api/media?venue=' + this.state.venue._id;
    console.log(route);
    fetch(route, {
      method: 'get',
    })
    .then(response => {
      context.setState({media: JSON.parse(response._bodyInit)});
      this.render();
    });

    console.log(context.state.media);

  },


  componentDidMount: function() {
    KeyboardEventEmitter.on(KeyboardEvents.KeyboardWillShowEvent, this.updateKeyboardSpace);
    KeyboardEventEmitter.on(KeyboardEvents.KeyboardWillHideEvent, this.resetKeyboardSpace);
    this.addListenerOn(this.eventEmitter, 'imagePressed', this.imagePressed);
    this.fetchVenue();
    this.addListenerOn(this.eventEmitter, 'mediaUpdated', this.fetchMedia);
  },

  reloadComments() {
    var route = config.serverURL + '/api/venues/' + this.state.venue._id;
    fetch(route)
      .then(response => response.json())
      .then(function(res) {
        for (var i = 0; i < res.comments.length; i++) {
          res.comments[i].datetime = moment(res.comments[i].datetime).fromNow();
        }
        return res;
      })
      .then(json => this.setState({
        venue: json,
        dataSource: ds.cloneWithRows(json.comments),
        attendeeCount: Object.keys(json.attendees).length
      }))
  },

  calculateDistance: function(current, venue) {
    Number.prototype.toRadians = function () { return this * Math.PI / 180; };
    var lon1 = current.longitude;
    var lon2 = venue.longitude;

    var lat1 = current.latitude;
    var lat2 = venue.latitude;

    var R = 6371000; // metres
    var φ1 = lat1.toRadians();
    var φ2 = lat2.toRadians();
    var Δφ = (lat2-lat1).toRadians();
    var Δλ = (lon2-lon1).toRadians();

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;

  },

  componentWillReceiveProps: function(nextProps) {
    var venue = nextProps.venue;
    var route = config.serverURL + '/api/venues/' + venue._id;
    var context = this;

    // socket.on('media-' + venue.id, function (data) {
    //   alert('media updated!');
    //   socket.emit('my other event', { my: 'data' });
    // });

    var venueChanged = this.props.venue.id !== venue.id;

    if (nextProps.geolocation) {
      var coords = nextProps.geolocation.coords;
      var distance = this.calculateDistance(coords, venue);
    }
    if (venueChanged) {
      this.fetchMedia(venue);
      
      fetch(route)
        .then(response => response.json())
        .then(json => {
          json.datetime = moment(json.datetime).format("dddd, MMMM Do YYYY, h:mm:ss a");
          for (var i = 0; i < json.comments.length; i++) {
            json.comments[i].datetime = moment(json.comments[i].datetime).fromNow();
          }
          this.setState({
            venue: json,
            dataSource: ds.cloneWithRows(json.comments),
            // Sets atVenue to true if user is within 100 metres
            atVenue: distance < 100,
            attendeeCount: Object.keys(json.attendees).length
          }, function() {
            context.getOverallRating();
          });

          fetch(route)
            .then(response => response.json())
            .then(json => {
              json.datetime = moment(json.datetime).format("dddd, MMMM Do YYYY, h:mm:ss a");
              for (var i = 0; i < json.comments.length; i++) {
                json.comments[i].datetime = moment(json.comments[i].datetime).fromNow();
              }
              this.setState({
                venue: json,
                dataSource: ds.cloneWithRows(json.comments),
                // Sets atVenue to true if user is within 100 metres
                atVenue: distance < 100,
                attendeeCount: Object.keys(json.attendees).length
              },
              function() {
                this.getOverallRating();
              })
            })
        })
    } else {
      this.setState({
        atVenue: distance < 100
      }, function() {
        context.getOverallRating();
      })
    }
  },

  fetchVenue: function() {
    var context = this;
    var venue = this.state.venue;
    var route = config.serverURL + '/api/venues/' + venue._id;
    fetch(route)
      .then(response => response.json())
      .then(json => {
        for (var i = 0; i < json.comments.length; i++) {
          json.comments[i].datetime = moment(json.comments[i].datetime).fromNow();
        }
        context.setState({
          venue: json,
          dataSource: ds.cloneWithRows(json.comments),
          // Sets atVenue to true if user is within 100 metres
          attendeeCount: Object.keys(json.attendees).length
        });
      })
  },

  componentWillMount: function() {
    this.eventEmitter = this.props.eventEmitter;
    var context = this;
    // retrieve user id, may be replaced with device UUID in the future
    var context = this;
    // Get Device UUID
    DeviceUUID.getUUID().then((uuid) => {
      return uuid;
    })
    .then((uuid) => {
      fetch(config.serverURL + '/api/users/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({token: uuid})
      }) // no ;
      .then(response => response.json())
      .then(json => context.setState({user: json._id}))
      .then(function() {
        context.fetchVenue();
        context.getOverallRating();
        })
    })
    .catch((err) => {
      console.log(err);
    });
  },

  getOverallRating() {
    var ratings = this.state.venue.ratings;
    var numRatings = Object.keys(ratings).length;
    var sum = 0;
    var userAlreadyRated = false;
    for (var userID in ratings) {
      sum += ratings[userID];
      if (userID === this.state.user) {
        this.setState({userLastRating: ratings[userID]});
        this.setState({voteValue: ratings[userID] / 10});
        userAlreadyRated = true;
      }
    }
    if (userAlreadyRated === false) {
      this.setState({voteValue: 0});
    }
    if (userAlreadyRated === false) {
      this.setState({userLastRating: 'N/A'});
    }
    if (numRatings > 0) {
      var average = Math.round(sum / numRatings);
    } else {
      var average = 'No ratings!';
    }
    this.setState({overallRating: average});
  },

  renderComments(comments) {
    if (comments) {
      var icon = 'fontawesome|' + comments.icon;
      var color = comments.color;
      var atVenue = comments.atVenue;
      var commentID = comments._id;
      if (atVenue) {
        var commentTextColor = '#000000';
      } else {
        var commentTextColor = '#898888';
      }
      return (
        <View style={styles.commentContainer} flexWrap="wrap">
          <Icon
            name={icon}
            size={19}
            color={color}
            style={styles.icon}
            />
          <Text flexWrap="wrap" numberOfLines={3} style={{flex: 1, color: commentTextColor}}>
            {comments.datetime}: {comments.content}
          </Text>
          <TouchableHighlight
            underlayColor='white'
            activeOpacity={0.4}
            onPress={this.flag.bind(this, commentID)}>
            <Icon
              name="fontawesome|flag-o"
              size={19}
              color="#898888"
              style={styles.icon} />
          </TouchableHighlight>
        </View>
      )
    }
  },

  flag(commentID) {
    var context = this;
    var route = config.serverURL + '/api/comments/';
    var user = this.state.user;
    var shouldDelete = false;
    var flags;
    fetch(route + commentID)
      .then(response => response.json())
      .then(json => {
        var userAlreadyFlagged = false;
        if (json.flags.length === 0) {
          flags = [user];
        } else {
          for (var i = 0; i < json.flags.length; i++) {
            if (json.flags[i] === user) {
              userAlreadyFlagged = true;
            }
          }
          if (userAlreadyFlagged === false) {
            json.flags.push(user);
            flags = json.flags;
          }
          if (flags.length === 3) {
            shouldDelete = true;
          }
        }
        if (userAlreadyFlagged === false) {
          fetch(config.serverURL + '/api/comments/flag/' + json._id, {
            method: 'post',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              flags: flags,
              shouldDelete: shouldDelete
            })
          })
          .then(function() {
            context.fetchVenue();
          });
        }
      })
  },

  getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    console.log(color);
    return color;
  },

  getRandomIcon() {
    var icons = ['hourglass', 'automobile', 'binoculars', 'birthday-cake', 'bullhorn', 'paw', 'plane', 'ship', 'truck', 'rocket', 'motorcycle', 'balance-scale', 'bank', 'beer', 'bell-o', 'book', 'coffee', 'flag-checkered', 'money', 'lightbulb-o', 'paint-brush', 'suitcase', 'shopping-cart', 'bolt', 'camera', 'headphones'];
    return icons[Math.floor(Math.random()*icons.length)];
  },

  submitComment() {
    var context = this;
    var route = config.serverURL + '/api/venues/' + this.state.venue._id;
    var userAlreadyPosted = false;
    var icon;
    var color;
    if (this.state.atVenue === false) {
      this.setState({commentColor: '#898888'});
    } else {
      this.setState({commentColor: '#000000'});
    }
    fetch(route)
      .then(response => response.json())
      .then(res => {
        for (var i = 0; i < res.comments.length; i++) {
          if (res.comments[i].creator === context.state.user) {
            userAlreadyPosted = true;
            icon = res.comments[i].icon;
            color = res.comments[i].color;
            break;
          }
        }
        if (userAlreadyPosted === false) {
          icon = context.getRandomIcon();
          color = context.getRandomColor();
        }
        if (this.state.text) {
          var content = this.state.text;
          var creator = this.state.user;
          var venue = this.state.venue._id;
          var datetime = new Date().toISOString();
          var atVenue = this.state.atVenue;
          var flags = [];
          fetch(config.serverURL + '/api/comments/', {
            method: 'post',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              content: content,
              creator: creator,
              venue: venue,
              datetime: datetime,
              atVenue: atVenue,
              icon: icon,
              color: color,
              flags: flags
            })
          })
            .then(function(res) {
              context.setState({text: ''});
              context.fetchVenue();
              return res.json();
            })
        }
      })
  },

  slidingComplete(voteValue, venue) {
    var voteValue = Math.round(voteValue*10);
    this.setState({userLastRating: voteValue});
    fetch(config.serverURL + '/api/venues/rate/' + venue._id, {
      method: 'post',
      headers:  {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: this.state.user,
        rating: voteValue
      })
    })
    .then(response => response.json())
    .then(json => {
      console.log(json.ratings);
      this.setState({
        venue: json,
        attendeeCount: Object.keys(json.attendees).length
      },
        function() {
          this.getOverallRating();
        });
    });
  },

  imagePressed(uri) {
    this.setModalVisible(true, uri);
  },

  setModalVisible(visible, uri) {
    this.setState({modalVisible: visible, uri: uri});
  },

  toggleCamera(visible) {
    this.setState({modalCameraVisible: !this.state.modalCameraVisible});
  },

  setPopupVisible(visible) {
    this.setState({popupVisible: visible});
  },

  showImageOrVideo() {
    if (this.state.uri) {
      if (this.state.uri.indexOf('.') === -1) { //(if video) this will have to be changed later.
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
      } else { //if image
        return (
          <Image style={styles.image} source={{uri:this.state.uri}} />
        )
      }
    }
  },

  render() {
    var venue = this.props.venue;
    return (
      <View style={styles.main}>
        <Modal 
          visible={this.state.popupVisible === true}
          animated={true}
          transparent={true}>
          <View style={styles.popupContainer}>
            <View style={styles.innerContainer}>
              <Text style={styles.venueName}>
                {venue.title}
              </Text>
              <Text style={styles.text} >
                Venue description: {venue.description}
              </Text>
              <Text style={styles.text} >
                {venue.address}
              </Text>
              <Text style={styles.text}>
                Current attendees: {this.state.attendeeCount}
              </Text>
              <Button
                onPress={this.setPopupVisible.bind(this, false)}
                style={styles.modalButton}>
                Close
              </Button>
            </View>
          </View>
        </Modal>

        <View style={styles.headerContainer}>
          <Button
            onPress={this.setPopupVisible.bind(this, true)}
            style={styles.infoButton}>
            <Icon
              name='fontawesome|info-circle'
              size={19}
              color='gray'
              style={styles.icon}/>
          </Button>

          <Text 
            style={styles.venueName}
            numberOfLines={1}>
            {venue.title}
          </Text>
        </View>

        <View style={styles.mediaContainer}>
          <ScrollView
            horizontal={true}
            style={styles.horizontalScrollView}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
            directionalLockEnabled={true}
            automaticallyAdjustContentInsets={false}>
            {this.state.media.map(createThumbRow.bind(this, this.eventEmitter))}
          </ScrollView>
        </View>

        <Text style={[styles.text, styles.yourRating]} >
          Overall rating: {this.state.overallRating} | Your last rating: {this.state.userLastRating}
        </Text>
        <SliderIOS
          style={styles.slider}
          onSlidingComplete={(voteValue) => this.slidingComplete(voteValue, venue)}
          maximumTrackTintColor='#f92672'
          minimumTrackTintColor='#66d9ef'
          value={this.state.voteValue}/>
        <RefreshableListView
          style={styles.refreshableListView}
          dataSource={this.state.dataSource}
          renderRow={this.renderComments}
          loadData={this.fetchVenue}
          refreshDescription="Refreshing comments" />

        <View style={[styles.inputContainer, {marginBottom: this.state.bottom}]}>  
          <Button style={styles.cameraButton} onPress={this.toggleCamera}>
            <Icon
              name='fontawesome|camera-retro'
              size={30}
              color='gray'
              style={styles.icon}/>
          </Button>
          <TextInput
            style={styles.textInput}
            onChangeText={(text) => this.setState({text})}
            value={this.state.text}
            onSubmitEditing={this.submitComment}
            returnKeyType='send'
            placeholder=' Unleash your inner Kraken' />
        </View>

        <Modal 
          visible={this.state.modalVisible === true}
          animated={true}
          transparent={true}>
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

        <Modal visible={this.state.modalCameraVisible === true}>
          <View style={styles.modalCameraContainer}>
            <View style={styles.innerContainer}>
              <KrakenCamera venue={this.state.venue} user={this.state.user} />
              <Button 
                onPress={this.toggleCamera}
                style={styles.modalButton}>
                Close
              </Button>
            </View>
          </View>
        </Modal>
        <View style={{height: this.state.keyboardSpace}}></View>
      </View>
    );
  }
});


var Thumb = React.createClass({
  shouldComponentUpdate: function(nextProps, nextState) {
    return false;
  },

  componentWillMount: function() {
    this.eventEmitter = this.props.eventEmitter;
  },

  onPressImage() {
    this.eventEmitter.emit('imagePressed', this.props.uri);
  },

  imageOrVideo() {
    if (this.props.uri.indexOf('.') === -1) { // (if video) this will have to be changed. Vid names right now don't have dots.
      return (
        <Video source={{uri: this.props.uri}}
          rate={1.0}
          volume={1.0}
          muted={true}
          paused={true}
          resizeMode="cover"
          repeat={true}
          style={styles.thumbVideo} />
      )
    } else { //if image
      return (
        <Image style={styles.thumbImage} source={{uri:this.props.uri}} />
      )
    }
  },

  render: function() {
    return (
      <TouchableHighlight onPress={this.onPressImage}>
        {this.imageOrVideo()}
      </TouchableHighlight>
    );
  }
});

var createThumbRow = (eventEmitter, uri, i) => <Thumb eventEmitter={eventEmitter} key={i} uri={uri} />;

var styles = StyleSheet.create({
  // venue view container
  main: {
    flex: 1,
  },

  // general text style
  text: {
    fontFamily: 'Avenir',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    margin: 3,
  },

  // header container and children
  headerContainer: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueName: {
    flex: 1,
    fontFamily: 'Avenir',
    fontSize: 20,
    textAlign: 'center',
  },
  infoButton: {
    flex: 0,
    padding: 3
  },

  alignLeft: {
    textAlign: 'left'
  },

  yourRating: {
    marginBottom: 5
  },

  // thumbnail for media
  thumbImage: {
    flex: 1,
    width: 70,
    height: 70,
    margin: 0,
    padding: 0
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalScrollView: {
    height: 70,
    width: Display.width,
    marginTop: 10,
  },

  // slider
  slider: {
    marginTop: 5,
    height: 15,
    marginLeft: 40,
    marginRight: 40,
    marginBottom: 5,
  },


  // comments refreshable view
  refreshableListView: {
    flex: 1,
    flexDirection: 'column',
    padding: 5,
    marginTop: 10,
    // height: Display.height * 0.49
  },

  // comment input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5
  },
  textInput: {
    flex: 1,
    height: 30,
    borderWidth: 1,
    borderColor: '#66d9ef',
    color: '#8C8C8C'
  },
  // camera button
  cameraButton: {
    flex: 0,
    padding: 3,
    height: 30,
    width:30,
  },


  contentContainer: {
    height: 70,
    //width: 70,
    flex: 1,
    margin: 0,
    padding: 0
  },

  // info modal
  popupContainer: {
    justifyContent: 'center',
    height: 300,
    alignItems: 'center',
    backgroundColor: '#f5fcff'
  },

  // camera modal
  modalCameraContainer: {
    flex: 1,
    justifyContent: 'center',
    //padding: 20,
    alignItems: 'center',
    backgroundColor: '#f5fcff'
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
  thumbVideo: {
    flex: 1,
    width: 70,
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
  commentContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  commentText: {
    flex: 1
  }
});

var animations = {
  layout: {
    spring: {
      duration: 200,
      create: {
        duration: 200,
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 400,
      },
    },
    easeInEaseOut: {
      duration: 200,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    },
  },
};

module.exports = VenueTab;
