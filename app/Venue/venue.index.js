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
var config = require('../config');

var {
  SliderIOS,
  Text,
  StyleSheet,
  View,
  ListView,
  TextInput,
  Image,
  ScrollView
  } = React;

var RefreshableListView = require('react-native-refreshable-listview');
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

var VenueTab = React.createClass({
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
      keyboardSpace: 0
    };
  },

  updateKeyboardSpace(frames) {
    this.setState({keyboardSpace: frames.end.height});
  },

  resetKeyboardSpace() {
    this.setState({keyboardSpace: 0});
  },

  componentDidMount: function() {

  },

  reloadComments() {
    console.log(this.state.venue);

    console.log('device height:     ', Display.height);
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
    console.log(nextProps);
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
          atVenue: distance < 100},
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
    var sum = 0;
    for (var i = 0; i < ratings.length; i++) {
      sum += ratings[i].rating;
    }
    if (ratings.length > 0) {
      var average = Math.round(sum / ratings.length);
    } else {
      var average = 'No ratings yet!';
    }
    this.setState({overallRating: average});
  },

  setRoundVoteValue(voteValue) {
    voteValue *= 10;
    voteValue = Math.round(voteValue);
    this.setState({voteValue: voteValue})
  },

  renderComments(comments) {
    return <Text>{comments.datetime}: {comments.content}</Text>
    //return <Text>{comments}</Text>
  },

  submitComment() {
    //this gets called when "submit comment" gets pushed.
    // {
//   content: "Comment text",
//   creator: "55e39290c2b4e82b4839046a", // ID of the user posting the comment
//   venue: "55e394d6c2b4e82b48390473", // ID of the event that the comment is associated with
//   datetime: "2016-03-30T06:20:46.000Z",
//   atVenue: true
// }
    var context = this;
    if (this.state.text) {
      var content = this.state.text;
      //TODO: make creator the actual creator, not a hardcoded creator
      var creator = this.state.user; //hardcoded for now
      var venue = this.state.venue._id;
      var datetime = new Date().toISOString();
      var atVenue = true;
      console.log('This is the post object: ', content, creator, venue, datetime, atVenue);
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
          atVenue: atVenue
        })
      })
        .then(function(res) {
          context.setState({text: ''});
          context.reloadComments();
          return res.json();
        })
    }
  },

  slidingComplete(voteValue, venue) {
    fetch(config.serverURL + '/api/venues/' + venue._id)
      .then(response => response.json())
      .then(modVenue => {
        for (var i = 0; i < modVenue.ratings.length; i++) {
          if (modVenue.ratings[i].user === this.state.user) {
            modVenue.ratings[i].rating = Math.round(voteValue*10);
            break;
          }
        }
        if (i === modVenue.ratings.length) {
          modVenue.ratings.push({
            rating: Math.round(voteValue*10),
            user: this.state.user
          });
        }
        fetch(config.serverURL + '/api/venues/', {
          method: 'put',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(modVenue)
        })
          .then(response => response.json())
          .then(json => {
            this.setState({venue: json},
              function() {
                this.getOverallRating();
              });
          });
      });
  },

  render() {
    var venue = this.props.venue;
    var THUMB_URLS = ['http://www.fubiz.net/wp-content/uploads/2012/03/the-kraken-existence2.jpg', 'http://img2.wikia.nocookie.net/__cb20140311041907/villains/images/b/bb/The_Kraken.jpg', 'http://vignette2.wikia.nocookie.net/reddits-world/images/8/8e/Kraken_v2_by_elmisa-d70nmt4.jpg/revision/latest?cb=20140922042121', 'http://orig11.deviantart.net/ccd8/f/2011/355/0/c/kraken_by_elmisa-d4ju669.jpg', 'http://orig14.deviantart.net/40df/f/2014/018/d/4/the_kraken_by_alexstoneart-d72o83n.jpg', 'http://orig10.deviantart.net/bf30/f/2010/332/f/5/kraken_by_mabuart-d33tchk.jpg', 'http://static.comicvine.com/uploads/original/12/120846/2408132-kraken_by_neo_br.jpg', 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Colossal_octopus_by_Pierre_Denys_de_Montfort.jpg', 'http://www.wallpaper4me.com/images/wallpapers/deathbykraken-39598.jpeg', 'http://img06.deviantart.net/3c5b/i/2012/193/d/9/kraken__work_in_progress_by_rkarl-d56zu66.jpg', 'http://i.gr-assets.com/images/S/photo.goodreads.com/hostedimages/1393990556r/8792967._SY540_.jpg', 'http://static.fjcdn.com/pictures/Kraken+found+on+tumblr_5b3d72_4520925.jpg'];
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
        <Text style={styles.text} >
          Time: {venue.datetime}
        </Text>
        <Text style={[styles.text, styles.yourRating]} >
          Overall rating: {this.state.overallRating} | Your last rating: {this.state.voteValue}
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
          iosdirectionalLockEnabled={true}>
          {THUMB_URLS.map(createThumbRow)}
        </ScrollView>
        <TextInput
          style={styles.textInput}
          onChangeText={(text) => this.setState({text})}
          value={this.state.text}
          onSubmitEditing={this.submitComment}
          returnKeyType='send'
          placeholder='Submit Comment'
          />
        <Button style={styles.commentButton} onPress={this.submitComment}>
          Submit Comment
        </Button>

        <RefreshableListView
          style={styles.refreshableListView}
          dataSource={this.state.dataSource}
          renderRow={this.renderComments}
          loadData={this.reloadComments}
          refreshDescription="Refreshing comments"
          />
        <View style={{height: this.state.keyboardSpace}}></View>
      </View>
    );
  }
});

var Thumb = React.createClass({
  shouldComponentUpdate: function(nextProps, nextState) {
    return false;
  },
  render: function() {
    return (
      <View style={styles.thumbView}>
        <Image style={styles.img} source={{uri:this.props.uri}} />
      </View>
    );
  }
});

var createThumbRow = (uri, i) => <Thumb key={i} uri={uri} />;

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
    marginTop: 20,
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
    marginBottom: 15,
    borderWidth: 1
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
    bottom: 0,
    height: Display.height * 0.49
  },

  img: {
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
    flex: 1,
    flexDirection: 'row'
  },
  //contentContainer: {
  //  height: 70,
  //  width: 70,
  //  flex: 1
  //},
  thumbView: {
    flex: 1,
    height: 70,
    width: 70
  }
  //contentContainer: {
  //  //height: 0,
  //  flex: 1
  //}
});

module.exports = VenueTab;