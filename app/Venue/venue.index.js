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
  SliderIOS,
  Text,
  StyleSheet,
  View,
  ListView,
  TextInput,
  Image,
  ScrollView,
  TouchableHighlight,
  Modal
  } = React;

var RefreshableListView = require('react-native-refreshable-listview');
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

var VenueTab = React.createClass({
  mixins: [Subscribable.Mixin],
  getInitialState() {
    KeyboardEventEmitter.on(KeyboardEvents.KeyboardDidShowEvent, (frames) => {
      this.setState({keyboardSpace: frames.end.height});
    });
    KeyboardEventEmitter.on(KeyboardEvents.KeyboardWillHideEvent, (frames) => {
      this.setState({keyboardSpace: 0});
    });
    return {
      voteValue: 0,
      venue: this.props.venue,
      overallRating: 0,
      dataSource: ds.cloneWithRows(this.props.venue.comments),
      keyboardSpace: 0,
      modalCameraVisible: false
    };
  },

  updateKeyboardSpace(frames) {
    this.setState({keyboardSpace: frames.end.height});
  },

  resetKeyboardSpace() {
    this.setState({keyboardSpace: 0});
  },

  componentDidMount: function() {
    this.addListenerOn(this.eventEmitter, 'imagePressed', this.imagePressed);
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
      .then(json => this.setState({venue: json, dataSource: ds.cloneWithRows(json.comments)}))
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

    if (nextProps.geolocation) {
      var coords = nextProps.geolocation.coords;
      var distance = this.calculateDistance(coords, venue);
    }

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
    //this.setState({
    //  venue: venue,
    //  dataSource: ds.cloneWithRows(venue.comments)
    //});
  },

  componentWillMount: function() {
    // retrieve user id, may be replaced with device UUID in the future
    this.eventEmitter = this.props.eventEmitter;
    var context = this;
    // Get Device UUID
    DeviceUUID.getUUID().then((uuid) => {
      console.log('Device ID >>>>>>>>> ', uuid);
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
      .then(json => context.setState({user: json._id}));
      this.getOverallRating();
    })
    .catch((err) => {
      console.log(err);
    });
  },

  getOverallRating() {
    var ratings = this.state.venue.ratings;
    var numRatings = Object.keys(ratings).length;
    var sum = 0;
    for (var userID in ratings) {
      sum += ratings[userID];
    }
    if (numRatings > 0) {
      var average = Math.round(sum / numRatings);
    } else {
      var average = 'No ratings!';
    }
    this.setState({overallRating: average});
  },

  setRoundVoteValue(voteValue) {
    voteValue *= 10;
    voteValue = Math.round(voteValue);
    this.setState({voteValue: voteValue})
  },

  renderComments(comments) {
    if (comments) {
      var icon = 'fontawesome|' + comments.icon;
      var color = comments.color;
      var atVenue = comments.atVenue;
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
          <Text flexWrap="wrap" numberOfLines={3} style={{flex: 1, color: commentTextColor}}>{comments.datetime}: {comments.content}</Text>
        </View>
      )
    }
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
              color: color
            })
          })
            .then(function(res) {
              context.setState({text: ''});
              context.reloadComments();
              return res.json();
            })
        }
      })
  },

  slidingComplete(voteValue, venue) {
    fetch(config.serverURL + '/api/venues/rate/' + venue._id, {
      method: 'post',
      headers:  {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: this.state.user,
        rating: Math.round(voteValue * 10)
      })
    })
    .then(response => response.json())
    .then(json => {
      console.log(json.ratings);
      this.setState({venue: json},
        function() {
          this.getOverallRating();
        });
    });
  },

  imagePressed(uri) {
    this.setModalVisible(true, uri);
  },

  setModalVisible(visible, uri) {
    console.log('modal set to visible');
    this.setState({modalVisible: visible, uri: uri});
  },

  toggleCamera(visible) {
    this.setState({modalCameraVisible: !this.state.modalCameraVisible});
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
    var THUMB_URLS = ['sneakers', 'pool_party', 'http://www.fubiz.net/wp-content/uploads/2012/03/the-kraken-existence2.jpg', 'http://img2.wikia.nocookie.net/__cb20140311041907/villains/images/b/bb/The_Kraken.jpg', 'http://vignette2.wikia.nocookie.net/reddits-world/images/8/8e/Kraken_v2_by_elmisa-d70nmt4.jpg/revision/latest?cb=20140922042121', 'http://orig11.deviantart.net/ccd8/f/2011/355/0/c/kraken_by_elmisa-d4ju669.jpg', 'http://orig14.deviantart.net/40df/f/2014/018/d/4/the_kraken_by_alexstoneart-d72o83n.jpg', 'http://orig10.deviantart.net/bf30/f/2010/332/f/5/kraken_by_mabuart-d33tchk.jpg', 'http://static.comicvine.com/uploads/original/12/120846/2408132-kraken_by_neo_br.jpg', 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Colossal_octopus_by_Pierre_Denys_de_Montfort.jpg', 'http://www.wallpaper4me.com/images/wallpapers/deathbykraken-39598.jpeg', 'http://img06.deviantart.net/3c5b/i/2012/193/d/9/kraken__work_in_progress_by_rkarl-d56zu66.jpg', 'http://i.gr-assets.com/images/S/photo.goodreads.com/hostedimages/1393990556r/8792967._SY540_.jpg', 'http://static.fjcdn.com/pictures/Kraken+found+on+tumblr_5b3d72_4520925.jpg'];
    return (
      <View>
        <Text style={styles.header}>
          Kraken
        </Text>
        <Text style={styles.venueName}>
          {venue.title}
        </Text>
        <Text style={[styles.text, styles.alignLeft]} >
          Venue description: {venue.description}
        </Text>
        <Text style={[styles.text, styles.alignLeft]} >
          Address: {venue.address}
        </Text>
        <Text style={[styles.text, styles.yourRating]} >
          Overall rating: {this.state.overallRating} | Your last rating: {this.state.voteValue}
        </Text>
        <Text style={styles.text}>
          Current attendees: {this.state.attendeeCount}
        </Text>
        <SliderIOS
          style={styles.slider}
          onValueChange={(voteValue) => this.setState({voteValue: Math.round(voteValue*10)})}
          onSlidingComplete={(voteValue) => this.slidingComplete(voteValue, venue)}
          maximumTrackTintColor='red'/>
        <ScrollView
          horizontal={true}
          style={styles.horizontalScrollView}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          directionalLockEnabled={true}
          automaticallyAdjustContentInsets={false}>
          {THUMB_URLS.map(createThumbRow.bind(this, this.eventEmitter))}
        </ScrollView>
        <TextInput
          style={styles.textInput}
          onChangeText={(text) => this.setState({text})}
          value={this.state.text}
          onSubmitEditing={this.submitComment}
          returnKeyType='send'
          placeholder='Submit Comment' />
        <Button style={styles.commentButton} onPress={this.submitComment}>
          Submit Comment
        </Button>

        <Button style={styles.commentButton} onPress={this.toggleCamera}>
          Take a pitcha!
        </Button>

        <RefreshableListView
          style={styles.refreshableListView}
          dataSource={this.state.dataSource}
          renderRow={this.renderComments}
          loadData={this.reloadComments}
          refreshDescription="Refreshing comments" />

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
  text: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    margin: 3,
  },
  alignLeft: {
    //textAlign: 'left'
  },
  header: {
    fontSize: 22,
    textAlign: 'center',
    backgroundColor: '#000000',
    color: '#ffffff'
  },
  venueName: {
    fontSize: 20,
    textAlign: 'center'
  },
  yourRating: {
    marginBottom: 5
  },
  slider: {
    marginTop: 8,
    height: 20,
    marginLeft: 40,
    marginRight: 40,
    marginBottom: 10,
    flex: 0.5
  },
  textInput: {
    height: 30,
    borderColor: 'gray',
    margin: 5,
    marginLeft: 1,
    marginRight: 1,
    marginBottom: 15,

    borderWidth: 1,
    borderRadius: 5
  },
  commentButton: {
    fontSize: 20,
    flex: 1,
    textAlign: 'right',
    right: 10,
    alignSelf: 'flex-end'
  },
  refreshableListView: {
    flex: 1,
    flexDirection: 'column',
    margin: 10,
    marginLeft: 5,
    marginRight: 5,
    padding: 0,
    bottom: 0,
    height: Display.height * 0.49
  },

  thumbImage: {
    flex: 1,
    width: 70,
    height: 70,
    margin: 0,
    padding: 0
  },
  horizontalScrollView: {
    height: 70,
    width: Display.width,
    marginTop: 10,
    flex: 1
  },
  contentContainer: {
    height: 70,
    //width: 70,
    flex: 1,
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
  modalCameraContainer: {
    flex: 1,
    justifyContent: 'center',
    //padding: 20,
    alignItems: 'center',
    backgroundColor: '#f5fcff'

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

module.exports = VenueTab;
